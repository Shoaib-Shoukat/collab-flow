import express from "express";
import {
  createRelease,
  getReleases,
  getReleaseById,
  updateRelease,
  addMilestone,
  completeMilestone,
  addTaskToRelease,
  addBugFixToRelease,
  publishRelease,
  deleteRelease
} from "../controllers/releaseController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.post("/", authMiddleware, createRelease);
r.get("/:projectId", authMiddleware, getReleases);
r.get("/:releaseId/details", authMiddleware, getReleaseById);
r.put("/:releaseId", authMiddleware, updateRelease);
r.post("/:releaseId/milestone", authMiddleware, addMilestone);
r.put("/:releaseId/milestone/:milestoneIndex", authMiddleware, completeMilestone);
r.post("/:releaseId/task", authMiddleware, addTaskToRelease);
r.post("/:releaseId/bug", authMiddleware, addBugFixToRelease);
r.post("/:releaseId/publish", authMiddleware, publishRelease);
r.delete("/:releaseId", authMiddleware, deleteRelease);

export default r;
