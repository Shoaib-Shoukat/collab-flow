import express from "express";
import {
  createBug,
  getBugs,
  getBugById,
  updateBug,
  deleteBug,
  addCommentToBug,
  addAttachmentToBug,
  watchBug,
  unwatchBug,
  searchBugs,
  getBugStats
} from "../controllers/bugController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.post("/", authMiddleware, createBug);
r.get("/search", authMiddleware, searchBugs);
r.get("/project/:projectId/stats", authMiddleware, getBugStats);
r.get("/:id", authMiddleware, getBugById);
r.get("/", authMiddleware, getBugs);
r.put("/:id", authMiddleware, updateBug);
r.delete("/:id", authMiddleware, deleteBug);
r.post("/:id/comment", authMiddleware, addCommentToBug);
r.post("/:id/attachment", authMiddleware, addAttachmentToBug);
r.post("/:id/watch", authMiddleware, watchBug);
r.post("/:id/unwatch", authMiddleware, unwatchBug);

export default r;