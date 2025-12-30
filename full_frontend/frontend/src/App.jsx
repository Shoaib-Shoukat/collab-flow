import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Pages
import Dashboard from "./pages/Dashboard";
import Backlog from "./pages/Backlog";
import SprintPage from "./pages/SprintPage";
import BugsPage from "./pages/BugsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import KanbanView from "./pages/KanbanView";
import TeamView from "./pages/TeamView";

// Components
import Sidebar from "./components/common/Sidebar";
import NotificationContainer from "./components/common/NotificationContainer";

// Socket & Redux
import socket from "./socket";
import {
  taskAddedRealtime,
  taskUpdatedRealtime,
  taskDeletedRealtime,
} from "./features/tasks/taskSlice";
import { sprintUpdatedRealtime } from "./features/sprints/sprintSlice";
import { bugCreatedRealtime } from "./features/bugs/bugSlice";
import { addNotification } from "./features/notifications/notificationSlice";

function AppLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-screen">
        {children}
      </main>
      <NotificationContainer />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("joinProject", { projectId: "default" });

      socket.on("taskCreated", (data) => {
        dispatch(taskAddedRealtime(data));
        dispatch(addNotification({
          message: `New task: ${data.title}`,
          type: 'success'
        }));
      });

      socket.on("taskUpdated", (data) => {
        dispatch(taskUpdatedRealtime(data));
        dispatch(addNotification({
          message: `Task updated: ${data.title}`,
          type: 'info'
        }));
      });

      socket.on("taskDeleted", (id) => {
        dispatch(taskDeletedRealtime(id));
        dispatch(addNotification({
          message: 'Task deleted',
          type: 'warning'
        }));
      });

      socket.on("sprintUpdated", (data) => {
        dispatch(sprintUpdatedRealtime(data));
        dispatch(addNotification({
          message: `Sprint updated: ${data.name}`,
          type: 'info'
        }));
      });

      socket.on("bugCreated", (data) => {
        dispatch(bugCreatedRealtime(data));
        dispatch(addNotification({
          message: `🐛 New bug: ${data.title}`,
          type: data.severity === 'Critical' ? 'error' : 'warning'
        }));
      });
    }
    return () => {
      if (socket && socket.connected) {
        socket.emit("leaveProject", { projectId: "default" });
        socket.disconnect();
      }
    };
  }, [user, dispatch]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kanban" element={<KanbanView />} />
        <Route path="/sprint" element={<SprintPage />} />
        <Route path="/backlog" element={<Backlog />} />
        <Route path="/bugs" element={<BugsPage />} />
        <Route path="/team" element={<TeamView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
