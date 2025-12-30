import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  addAttachment,
  watchTask,
  unwatchTask,
  searchTasks
} from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.post("/", authMiddleware, createTask);
r.get("/search", authMiddleware, searchTasks);
r.get("/:id", authMiddleware, getTaskById);
r.get("/", authMiddleware, getTasks);
r.put("/:id", authMiddleware, updateTask);
r.delete("/:id", authMiddleware, deleteTask);
r.post("/:id/comment", authMiddleware, addComment);
r.post("/:id/attachment", authMiddleware, addAttachment);
r.post("/:id/watch", authMiddleware, watchTask);
r.post("/:id/unwatch", authMiddleware, unwatchTask);

export default r;