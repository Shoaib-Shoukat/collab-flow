import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";
import Bug from "../models/Bug.js";
import User from "../models/User.js";

export const getDashboardWidgets = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [activeSprint, allTasks, allBugs, teamMembers] = await Promise.all([
      Sprint.findOne({ projectId, status: "Active" }),
      Task.find({ projectId }),
      Bug.find({ projectId }),
      User.find()
    ]);

    const velocityWidget = await getVelocityWidget(projectId);
    const burndownWidget = activeSprint ? await getBurndownWidget(activeSprint._id) : null;
    const bugsWidget = getBugsWidget(allBugs);
    const workloadWidget = await getWorkloadWidget(projectId);
    const activityWidget = await getActivityWidget(projectId);

    res.json({
      velocity: velocityWidget,
      burndown: burndownWidget,
      bugs: bugsWidget,
      workload: workloadWidget,
      activity: activityWidget,
      activeSprint: activeSprint ? { id: activeSprint._id, name: activeSprint.name, endDate: activeSprint.endDate } : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVelocityWidget = async (projectId) => {
  const sprints = await Sprint.find({ projectId, status: "Completed" })
    .sort({ endDate: -1 })
    .limit(5);

  const velocities = await Promise.all(
    sprints.map(async (sprint) => {
      const tasks = await Task.find({ sprintId: sprint._id, status: "Done" });
      const velocity = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      return { sprint: sprint.name, velocity, date: sprint.endDate };
    })
  );

  const avgVelocity = velocities.length > 0 ? (velocities.reduce((sum, v) => sum + v.velocity, 0) / velocities.length).toFixed(2) : 0;

  return {
    title: "Sprint Velocity",
    averageVelocity: avgVelocity,
    trend: velocities.reverse(),
    status: velocities[0]?.velocity > avgVelocity ? "up" : "down"
  };
};

const getBurndownWidget = async (sprintId) => {
  const sprint = await Sprint.findById(sprintId);
  const tasks = await Task.find({ sprintId });

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedPoints = tasks.filter(t => t.status === "Done").reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const remainingPoints = totalPoints - completedPoints;

  const daysElapsed = Math.ceil((new Date() - sprint.startDate) / (1000 * 60 * 60 * 24));
  const sprintDays = Math.ceil((sprint.endDate - sprint.startDate) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, sprintDays - daysElapsed);

  const completionPercentage = totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(2) : 0;
  const expectedCompletionPercentage = (daysElapsed / sprintDays * 100).toFixed(2);

  return {
    title: "Sprint Burndown",
    totalPoints,
    completedPoints,
    remainingPoints,
    completionPercentage,
    expectedCompletionPercentage,
    daysRemaining,
    sprintDays,
    isOnTrack: parseFloat(completionPercentage) >= parseFloat(expectedCompletionPercentage)
  };
};

const getBugsWidget = (bugs) => {
  const critical = bugs.filter(b => b.severity === "Critical").length;
  const high = bugs.filter(b => b.severity === "High").length;
  const medium = bugs.filter(b => b.severity === "Medium").length;
  const low = bugs.filter(b => b.severity === "Low").length;
  const open = bugs.filter(b => b.status === "Open" || b.status === "Reopened").length;

  return {
    title: "Bug Report",
    total: bugs.length,
    critical,
    high,
    medium,
    low,
    open,
    severity: { critical, high, medium, low },
    trend: open > 0 ? "up" : "stable"
  };
};

const getWorkloadWidget = async (projectId) => {
  const tasks = await Task.find({ projectId, status: { $ne: "Done" } }).populate("assigneeId", "name avatar");

  const workload = {};
  tasks.forEach(task => {
    if (task.assigneeId) {
      const userId = task.assigneeId._id.toString();
      if (!workload[userId]) {
        workload[userId] = {
          user: task.assigneeId.name,
          avatar: task.assigneeId.avatar,
          taskCount: 0,
          storyPoints: 0
        };
      }
      workload[userId].taskCount++;
      workload[userId].storyPoints += task.storyPoints || 0;
    }
  });

  return {
    title: "Team Workload",
    members: Object.values(workload),
    overloaded: Object.values(workload).filter(m => m.storyPoints > 30)
  };
};

const getActivityWidget = async (projectId) => {
  const recentTasks = await Task.find({ projectId })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate("assigneeId", "name")
    .select("title status priority updatedAt");

  const recentBugs = await Bug.find({ projectId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("assigneeId", "name")
    .select("title status severity updatedAt");

  return {
    title: "Recent Activity",
    recentTasks,
    recentBugs
  };
};

export const getSprintDashboard = async (req, res) => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const tasks = await Task.find({ sprintId });
    const bugs = await Bug.find({ sprintId });

    const dashboard = {
      sprint: {
        id: sprint._id,
        name: sprint.name,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      },
      stats: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === "Done").length,
        inProgressTasks: tasks.filter(t => t.status === "In Progress").length,
        totalStoryPoints: tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0),
        completedPoints: tasks.filter(t => t.status === "Done").reduce((sum, t) => sum + (t.storyPoints || 0), 0),
        totalBugs: bugs.length,
        openBugs: bugs.filter(b => b.status === "Open" || b.status === "Reopened").length
      },
      burndown: await getBurndownWidget(sprintId),
      topContributors: await getTopContributors(sprintId)
    };

    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getTopContributors = async (sprintId) => {
  const tasks = await Task.find({ sprintId }).populate("assigneeId", "name avatar");

  const contributors = {};
  tasks.forEach(task => {
    if (task.assigneeId) {
      const userId = task.assigneeId._id.toString();
      if (!contributors[userId]) {
        contributors[userId] = {
          name: task.assigneeId.name,
          avatar: task.assigneeId.avatar,
          taskCount: 0,
          completedCount: 0
        };
      }
      contributors[userId].taskCount++;
      if (task.status === "Done") {
        contributors[userId].completedCount++;
      }
    }
  });

  return Object.values(contributors)
    .sort((a, b) => b.completedCount - a.completedCount)
    .slice(0, 5);
};

export const getActivityHeatmap = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const activities = await Task.aggregate([
      {
        $match: { projectId: require("mongoose").Types.ObjectId(projectId), updatedAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ projectId, period: days, heatmap: activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
