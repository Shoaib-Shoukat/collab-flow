import schedule from "node-schedule";
import Task from "../models/Task.js";
import Sprint from "../models/Sprint.js";
import Bug from "../models/Bug.js";
import Notification from "../models/Notification.js";
import Automation from "../models/Automation.js";
import { sendNotification } from "./notificationService.js";

export const initializeCronJobs = () => {
  console.log("Initializing cron jobs...");

  // Check for due dates approaching (Every hour)
  schedule.scheduleJob("0 * * * *", async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const tasks = await Task.find({
        dueDate: { $lte: tomorrow },
        status: { $ne: "Done" }
      }).populate("assigneeId watchers");

      for (const task of tasks) {
        if (task.assigneeId) {
          await sendNotification(task.assigneeId._id, {
            type: "task_due_soon",
            title: "Task Due Soon",
            message: `Task "${task.title}" is due soon`,
            relatedTo: "task",
            relatedId: task._id,
            priority: "high"
          });
        }

        const automations = await Automation.find({
          projectId: task.projectId,
          trigger: "dueDateApproaching",
          isActive: true
        });

        for (const automation of automations) {
          for (const action of automation.actions) {
            if (action.type === "notifyUser") {
              await sendNotification(action.config.userId, {
                type: "due_date_approaching",
                title: action.config.title,
                message: action.config.message,
                relatedTo: "task",
                relatedId: task._id
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in due date check cron:", err);
    }
  });

  // Check for overdue tasks (Every 4 hours)
  schedule.scheduleJob("0 */4 * * *", async () => {
    try {
      const now = new Date();

      const overdueTasks = await Task.find({
        dueDate: { $lt: now },
        status: { $ne: "Done" }
      }).populate("assigneeId");

      for (const task of overdueTasks) {
        if (task.assigneeId) {
          await sendNotification(task.assigneeId._id, {
            type: "task_overdue",
            title: "Task Overdue",
            message: `Task "${task.title}" is overdue`,
            relatedTo: "task",
            relatedId: task._id,
            priority: "high"
          });
        }
      }
    } catch (err) {
      console.error("Error in overdue check cron:", err);
    }
  });

  // Archive old sprints (Every day at 2 AM)
  schedule.scheduleJob("0 2 * * *", async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Sprint.updateMany(
        { endDate: { $lt: thirtyDaysAgo }, status: "Completed" },
        { status: "Archived" }
      );

      console.log("Old sprints archived");
    } catch (err) {
      console.error("Error in sprint archival cron:", err);
    }
  });

  // Calculate sprint velocity (Every day at 11 PM)
  schedule.scheduleJob("0 23 * * *", async () => {
    try {
      const activeSprints = await Sprint.find({ status: "Active" });

      for (const sprint of activeSprints) {
        const tasks = await Task.find({ sprintId: sprint._id });
        const completedPoints = tasks
          .filter(t => t.status === "Done")
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        await Sprint.findByIdAndUpdate(sprint._id, {
          actualVelocity: completedPoints,
          remainingPoints: Math.max(
            0,
            sprint.plannedVelocity - completedPoints
          )
        });
      }

      console.log("Sprint velocities calculated");
    } catch (err) {
      console.error("Error in velocity calculation cron:", err);
    }
  });

  // Clean up old notifications (Every week)
  schedule.scheduleJob("0 0 * * 0", async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Notification.deleteMany({
        read: true,
        readAt: { $lt: thirtyDaysAgo }
      });

      console.log("Old notifications cleaned up");
    } catch (err) {
      console.error("Error in notification cleanup cron:", err);
    }
  });

  // Critical bug alert check (Every 30 minutes)
  schedule.scheduleJob("*/30 * * * *", async () => {
    try {
      const criticalBugs = await Bug.find({
        severity: "Critical",
        status: { $in: ["Open", "In Progress"] }
      }).populate("projectId");

      for (const bug of criticalBugs) {
        const automations = await Automation.find({
          projectId: bug.projectId._id,
          trigger: "criticalBugAlert",
          isActive: true
        });

        for (const automation of automations) {
          for (const action of automation.actions) {
            if (action.type === "broadcastAlert") {
              await sendNotification(action.config.userId, {
                type: "critical_bug_alert",
                title: "Critical Bug Alert",
                message: `Critical bug: ${bug.title}`,
                relatedTo: "bug",
                relatedId: bug._id,
                priority: "high"
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in critical bug check cron:", err);
    }
  });

  console.log("Cron jobs initialized successfully");
};
