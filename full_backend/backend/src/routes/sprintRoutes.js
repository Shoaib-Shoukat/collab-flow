import express from "express";
import {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  addTaskToSprint,
  removeTaskFromSprint,
  getSprintReport
} from "../controllers/sprintController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.post("/", authMiddleware, createSprint);
r.get("/", authMiddleware, getSprints);
r.get("/:id/details", authMiddleware, getSprintById);
r.put("/:id", authMiddleware, updateSprint);
r.delete("/:id", authMiddleware, deleteSprint);
r.post("/:id/start", authMiddleware, startSprint);
r.post("/:id/complete", authMiddleware, completeSprint);
r.post("/:sprintId/add-task", authMiddleware, addTaskToSprint);
r.delete("/:sprintId/task/:taskId", authMiddleware, removeTaskFromSprint);
r.get("/:sprintId/report", authMiddleware, getSprintReport);

export default r;