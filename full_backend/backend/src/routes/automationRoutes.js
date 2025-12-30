import express from "express";
import {
  createAutomation,
  getAutomations,
  updateAutomation,
  deleteAutomation,
  executeAutomation,
  testAutomation
} from "../controllers/automationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.post("/", authMiddleware, createAutomation);
r.get("/:projectId", authMiddleware, getAutomations);
r.put("/:automationId", authMiddleware, updateAutomation);
r.delete("/:automationId", authMiddleware, deleteAutomation);
r.post("/:automationId/execute", authMiddleware, executeAutomation);
r.get("/:automationId/test", authMiddleware, testAutomation);

export default r;
