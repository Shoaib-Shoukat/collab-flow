import Analytics from "../models/Analytics.js";
import Task from "../models/Task.js";
import Bug from "../models/Bug.js";
import Sprint from "../models/Sprint.js";
import User from "../models/User.js";

export const getSprintAnalytics = async (req, res) => {
  try {
    const { projectId, sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const tasks = await Task.find({ sprintId });
    const completedTasks = tasks.filter(t => t.status === "Done");
    const inProgressTasks = tasks.filter(t => t.status === "In Progress");

    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const remainingPoints = totalPoints - completedPoints;

    const sprintDuration = Math.ceil((sprint.endDate - sprint.startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((new Date() - sprint.startDate) / (1000 * 60 * 60 * 24));
    const burndownRate = sprintDuration > 0 ? (completedPoints / totalPoints) * 100 : 0;

    const cycleTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, t) => {
          const start = t.startDate || t.createdAt;
          const end = t.completedDate || new Date();
          return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        }, 0) / completedTasks.length 
      : 0;

    const analytics = {
      sprintId,
      projectId,
      metrics: {
        velocity: completedPoints,
        plannedVelocity: sprint.plannedVelocity || totalPoints,
        completedPoints,
        remainingPoints,
        totalPoints,
        burndownRate,
        cycleTime: Math.round(cycleTime),
        completionPercentage: totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0,
        sprintCompletionScore: Math.round((completedPoints / totalPoints) * 100) || 0
      },
      taskMetrics: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        blockedTasks: tasks.filter(t => t.status === "Blocked").length,
        overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "Done").length
      },
      daysElapsed,
      sprintDuration,
      estimatedCompletion: new Date(sprint.endDate)
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const tasks = await Task.find({ projectId, createdAt: { $gte: startDate } });
    const bugs = await Bug.find({ projectId, createdAt: { $gte: startDate } });
    const completedTasks = tasks.filter(t => t.status === "Done");

    const teamMetrics = await User.aggregate([
      {
        $match: { _id: { $in: tasks.map(t => t.assigneeId).filter(Boolean) } }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          count: { $sum: 1 }
        }
      }
    ]);

    const analytics = {
      projectId,
      period: { startDate, endDate: new Date(), days: parseInt(days) },
      metrics: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: tasks.filter(t => t.status === "In Progress").length,
        blockedTasks: tasks.filter(t => t.status === "Blocked").length,
        overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "Done").length
      },
      bugMetrics: {
        totalBugs: bugs.length,
        criticalBugs: bugs.filter(b => b.severity === "Critical").length,
        highBugs: bugs.filter(b => b.severity === "High").length,
        mediumBugs: bugs.filter(b => b.severity === "Medium").length,
        lowBugs: bugs.filter(b => b.severity === "Low").length,
        resolvedBugs: bugs.filter(b => b.status === "Closed" || b.status === "Resolved").length,
        openBugs: bugs.filter(b => b.status === "Open" || b.status === "Reopened").length
      },
      teamMetrics,
      completionRate: tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(2) : 0
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBurndownChart = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const tasks = await Task.find({ sprintId });
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const burndownChart = [];
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const completedByDate = tasks
        .filter(t => t.completedDate && t.completedDate <= d)
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      const remaining = totalPoints - completedByDate;

      burndownChart.push({
        date: new Date(d),
        remainingPoints: Math.max(0, remaining),
        completedPoints: completedByDate,
        plannedPoints: Math.max(0, totalPoints - ((d - startDate) / (endDate - startDate)) * totalPoints)
      });
    }

    res.json({
      sprintId,
      totalPoints,
      burndownChart
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVelocityTrend = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sprints = 10 } = req.query;

    const completedSprints = await Sprint.find({ projectId, status: "Completed" })
      .sort({ endDate: -1 })
      .limit(parseInt(sprints));

    const velocityData = [];

    for (const sprint of completedSprints) {
      const tasks = await Task.find({ sprintId: sprint._id });
      const completedPoints = tasks
        .filter(t => t.status === "Done")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      velocityData.push({
        sprintName: sprint.name,
        sprintId: sprint._id,
        velocity: completedPoints,
        date: sprint.endDate
      });
    }

    res.json({
      projectId,
      velocityTrend: velocityData.reverse(),
      averageVelocity: velocityData.length > 0
        ? (velocityData.reduce((sum, v) => sum + v.velocity, 0) / velocityData.length).toFixed(2)
        : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveAnalytics = async (req, res) => {
  try {
    const analytics = new Analytics(req.body);
    await analytics.save();
    res.status(201).json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeamWorkload = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({ projectId, status: { $ne: "Done" } }).populate("assigneeId", "name email");

    const workload = {};
    tasks.forEach(task => {
      if (task.assigneeId) {
        const userId = task.assigneeId._id.toString();
        if (!workload[userId]) {
          workload[userId] = {
            userId: task.assigneeId._id,
            name: task.assigneeId.name,
            email: task.assigneeId.email,
            taskCount: 0,
            storyPoints: 0,
            tasks: []
          };
        }
        workload[userId].taskCount++;
        workload[userId].storyPoints += task.storyPoints || 0;
        workload[userId].tasks.push({ id: task._id, title: task.title, points: task.storyPoints });
      }
    });

    res.json(Object.values(workload));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
