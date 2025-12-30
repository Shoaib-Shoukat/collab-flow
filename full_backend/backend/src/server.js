import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { initializeCronJobs } from "./services/cronJobs.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import sprintRoutes from "./routes/sprintRoutes.js";
import bugRoutes from "./routes/bugRoutes.js";
import backlogRoutes from "./routes/backlogRoutes.js";
import releaseRoutes from "./routes/releaseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/backlog", backlogRoutes);
app.use("/api/releases", releaseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/automations", automationRoutes);
app.use("/api/dashboard", dashboardRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Initialize cron jobs
initializeCronJobs();

// Socket.IO namespace for real-time updates
io.of("/tasks").on("connection", (socket) => {
  console.log("Task socket connected", socket.id);

  socket.on("watch_sprint", (sprintId) => {
    socket.join(`sprint:${sprintId}`);
  });

  socket.on("task_updated", (data) => {
    io.of("/tasks").to(`sprint:${data.sprintId}`).emit("task_changed", data);
  });

  socket.on("task_created", (data) => {
    io.of("/tasks").to(`project:${data.projectId}`).emit("new_task", data);
  });

  socket.on("task_status_changed", (data) => {
    io.of("/tasks").to(`sprint:${data.sprintId}`).emit("status_updated", data);
    socket.broadcast.emit("task_status_changed", data);
  });

  socket.on("disconnect", () => {
    console.log("Task socket disconnected", socket.id);
  });
});

io.of("/bugs").on("connection", (socket) => {
  console.log("Bug socket connected", socket.id);

  socket.on("watch_project_bugs", (projectId) => {
    socket.join(`project_bugs:${projectId}`);
  });

  socket.on("bug_created", (data) => {
    io.of("/bugs").to(`project_bugs:${data.projectId}`).emit("new_bug", data);
    if (data.severity === "Critical") {
      io.of("/bugs").emit("critical_bug_alert", data);
    }
  });

  socket.on("bug_updated", (data) => {
    io.of("/bugs").to(`project_bugs:${data.projectId}`).emit("bug_changed", data);
  });

  socket.on("bug_status_changed", (data) => {
    io.of("/bugs").to(`project_bugs:${data.projectId}`).emit("bug_status_updated", data);
  });

  socket.on("disconnect", () => {
    console.log("Bug socket disconnected", socket.id);
  });
});

io.of("/sprints").on("connection", (socket) => {
  console.log("Sprint socket connected", socket.id);

  socket.on("watch_sprint", (sprintId) => {
    socket.join(`sprint:${sprintId}`);
  });

  socket.on("sprint_started", (data) => {
    io.of("/sprints").to(`sprint:${data.sprintId}`).emit("sprint_active", data);
  });

  socket.on("sprint_completed", (data) => {
    io.of("/sprints").to(`sprint:${data.sprintId}`).emit("sprint_finished", data);
  });

  socket.on("burndown_updated", (data) => {
    io.of("/sprints").to(`sprint:${data.sprintId}`).emit("burndown_changed", data);
  });

  socket.on("disconnect", () => {
    console.log("Sprint socket disconnected", socket.id);
  });
});

io.of("/notifications").on("connection", (socket) => {
  console.log("Notification socket connected", socket.id);

  socket.on("register_user", (userId) => {
    socket.join(`user:${userId}`);
  });

  socket.on("send_notification", (data) => {
    io.of("/notifications").to(`user:${data.userId}`).emit("notification", data);
  });

  socket.on("broadcast_alert", (data) => {
    io.of("/notifications").to(`project:${data.projectId}`).emit("alert", data);
  });

  socket.on("disconnect", () => {
    console.log("Notification socket disconnected", socket.id);
  });
});

// General connection handler
io.on("connection", (socket) => {
  console.log("General socket connected", socket.id);

  socket.on("user_activity", (data) => {
    socket.broadcast.emit("user_online", data);
  });

  socket.on("disconnect", () => {
    console.log("General socket disconnected", socket.id);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Backend running on port ${process.env.PORT || 5000}`);
});
