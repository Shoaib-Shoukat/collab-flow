import express from "express";
import {
  getSprintAnalytics,
  getProjectAnalytics,
  getBurndownChart,
  getVelocityTrend,
  getTeamWorkload,
  saveAnalytics
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.get("/sprint/:projectId/:sprintId", authMiddleware, getSprintAnalytics);
r.get("/project/:projectId", authMiddleware, getProjectAnalytics);
r.get("/burndown/:sprintId", authMiddleware, getBurndownChart);
r.get("/velocity/:projectId", authMiddleware, getVelocityTrend);
r.get("/workload/:projectId", authMiddleware, getTeamWorkload);
r.post("/save", authMiddleware, saveAnalytics);

export default r;
