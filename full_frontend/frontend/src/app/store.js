import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/taskSlice';
import sprintsReducer from '../features/sprints/sprintSlice';
import bugsReducer from '../features/bugs/bugSlice';
import notificationsReducer from '../features/notifications/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    sprints: sprintsReducer,
    bugs: bugsReducer,
    notifications: notificationsReducer
  }
});

export default store;

