import express from "express";
import {
  getBacklog,
  addToBacklog,
  reorderBacklog,
  moveToSprint,
  searchBacklog,
  removeFromBacklog
} from "../controllers/backlogController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.get("/:projectId", authMiddleware, getBacklog);
r.post("/:projectId/add", authMiddleware, addToBacklog);
r.put("/:projectId/reorder", authMiddleware, reorderBacklog);
r.post("/:projectId/move-to-sprint", authMiddleware, moveToSprint);
r.get("/:projectId/search", authMiddleware, searchBacklog);
r.delete("/:backlogId", authMiddleware, removeFromBacklog);

export default r;
