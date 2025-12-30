import Automation from "../models/Automation.js";
import Task from "../models/Task.js";
import Bug from "../models/Bug.js";
import Notification from "../models/Notification.js";

export const createAutomation = async (req, res) => {
  try {
    const { projectId, name, trigger, triggerConfig, actions, conditions } = req.body;

    const automation = new Automation({
      projectId,
      name,
      trigger,
      triggerConfig,
      actions,
      conditions,
      createdById: req.user._id
    });

    await automation.save();
    res.status(201).json(automation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAutomations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const automations = await Automation.find({ projectId });
    res.json(automations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const automation = await Automation.findByIdAndUpdate(automationId, req.body, { new: true });
    res.json(automation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    await Automation.findByIdAndDelete(automationId);
    res.json({ message: "Automation deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const executeAutomation = async (req, res) => {
  try {
    const { automationId, taskId, bugId } = req.body;
    const automation = await Automation.findById(automationId);

    if (!automation || !automation.isActive) {
      return res.status(400).json({ error: "Automation not found or inactive" });
    }

    const results = [];

    for (const action of automation.actions) {
      try {
        let actionResult = { type: action.type, status: "pending" };

        if (action.type === "moveTask" && taskId) {
          await Task.findByIdAndUpdate(taskId, { status: action.config.targetStatus });
          actionResult.status = "completed";
        }

        if (action.type === "notifyUser" && action.config.userId) {
          const notification = new Notification({
            userId: action.config.userId,
            type: action.config.notificationType || "task_updated",
            title: action.config.title,
            message: action.config.message,
            relatedTo: taskId ? "task" : "bug",
            relatedId: taskId || bugId,
            priority: action.config.priority || "medium"
          });
          await notification.save();
          actionResult.status = "completed";
        }

        if (action.type === "broadcastAlert") {
          actionResult.status = "completed";
          actionResult.message = action.config.message;
        }

        if (action.type === "assignTask" && taskId && action.config.assigneeId) {
          await Task.findByIdAndUpdate(taskId, { assigneeId: action.config.assigneeId });
          actionResult.status = "completed";
        }

        if (action.type === "addLabel" && taskId && action.config.label) {
          await Task.findByIdAndUpdate(taskId, { $push: { labels: action.config.label } });
          actionResult.status = "completed";
        }

        if (action.type === "changeStatus" && taskId && action.config.status) {
          await Task.findByIdAndUpdate(taskId, { status: action.config.status });
          actionResult.status = "completed";
        }

        results.push(actionResult);
      } catch (actionErr) {
        results.push({ type: action.type, status: "failed", error: actionErr.message });
      }
    }

    await Automation.findByIdAndUpdate(automationId, {
      $push: {
        executionHistory: {
          triggeredAt: new Date(),
          status: "completed",
          taskId: taskId || null,
          actionsExecuted: results.filter(r => r.status === "completed").map(r => r.type),
          errors: results.filter(r => r.status === "failed").map(r => r.error)
        }
      }
    });

    res.json({ message: "Automation executed", results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const testAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const automation = await Automation.findById(automationId);

    if (!automation) return res.status(404).json({ error: "Automation not found" });

    const conditionsMet = automation.conditions.length === 0 || automation.conditions.every(cond => {
      return true;
    });

    res.json({
      automationId,
      trigger: automation.trigger,
      conditionsMet,
      actionCount: automation.actions.length,
      canExecute: automation.isActive && conditionsMet
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
