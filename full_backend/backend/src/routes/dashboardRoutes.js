import express from "express";
import {
  getDashboardWidgets,
  getSprintDashboard,
  getActivityHeatmap
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const r = express.Router();

r.get("/:projectId/widgets", authMiddleware, getDashboardWidgets);
r.get("/sprint/:sprintId", authMiddleware, getSprintDashboard);
r.get("/:projectId/activity-heatmap", authMiddleware, getActivityHeatmap);

export default r;
