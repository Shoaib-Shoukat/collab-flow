import Sprint from "../models/Sprint.js";
import Task from "../models/Task.js";
import Notification from "../models/Notification.js";

export const createSprint = async(req,res)=>{
  try {
    const { projectId, name, startDate, endDate, goal, teamMembers } = req.body;

    const sprint = new Sprint({
      projectId,
      name,
      startDate,
      endDate,
      goal,
      teamMembers: teamMembers || [],
      createdById: req.user._id,
      status: "Planned"
    });

    await sprint.save();
    await sprint.populate("teamMembers", "name email avatar");

    res.status(201).json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSprints = async(req,res)=>{
  try {
    const { projectId, status } = req.query;
    
    let query = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;

    const sprints = await Sprint.find(query)
      .populate("teamMembers", "name email avatar")
      .populate("createdById", "name email")
      .sort({ startDate: -1 });

    res.json(sprints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSprintById = async(req,res)=>{
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate("teamMembers", "name email avatar")
      .populate("tasks");

    if (!sprint) return res.status(404).json({ error: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSprint = async(req,res)=>{
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {new:true})
      .populate("teamMembers")
      .populate("createdById");

    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteSprint = async(req,res)=>{
  try {
    const sprint = await Sprint.findById(req.params.id);
    
    await Task.updateMany({ sprintId: req.params.id }, { sprintId: null, status: "Backlog" });
    await Sprint.findByIdAndDelete(req.params.id);

    res.json({message:"Sprint deleted and tasks moved to backlog"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const startSprint = async(req,res)=>{
  try {
    const { id } = req.params;

    const sprint = await Sprint.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    ).populate("teamMembers");

    const tasks = await Task.find({ sprintId: id });
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    await Sprint.findByIdAndUpdate(id, { 
      plannedVelocity: totalPoints,
      remainingPoints: totalPoints
    });

    sprint.teamMembers.forEach(async (member) => {
      const notification = new Notification({
        userId: member._id,
        type: "sprint_started",
        title: "Sprint Started",
        message: `Sprint ${sprint.name} has started`,
        relatedTo: "sprint",
        relatedId: id,
        priority: "high"
      });
      await notification.save();
    });

    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeSprint = async(req,res)=>{
  try {
    const { id } = req.params;

    const tasks = await Task.find({ sprintId: id });
    const completedPoints = tasks
      .filter(t => t.status === "Done")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completionPercentage = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

    const sprint = await Sprint.findByIdAndUpdate(
      id,
      { 
        status: "Completed",
        actualVelocity: completedPoints,
        completedPoints: completedPoints,
        remainingPoints: Math.max(0, totalPoints - completedPoints),
        "metrics.completionPercentage": completionPercentage
      },
      { new: true }
    ).populate("teamMembers");

    sprint.teamMembers.forEach(async (member) => {
      const notification = new Notification({
        userId: member._id,
        type: "sprint_ended",
        title: "Sprint Completed",
        message: `Sprint ${sprint.name} has been completed with ${completionPercentage.toFixed(2)}% completion`,
        relatedTo: "sprint",
        relatedId: id
      });
      await notification.save();
    });

    res.json(sprint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addTaskToSprint = async(req,res)=>{
  try {
    const { sprintId } = req.params;
    const { taskId } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { sprintId, status: "To Do" },
      { new: true }
    );

    await Sprint.findByIdAndUpdate(
      sprintId,
      { $addToSet: { tasks: taskId } }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeTaskFromSprint = async(req,res)=>{
  try {
    const { sprintId, taskId } = req.params;

    await Task.findByIdAndUpdate(taskId, { sprintId: null, status: "Backlog" });
    await Sprint.findByIdAndUpdate(sprintId, { $pull: { tasks: taskId } });

    res.json({ message: "Task removed from sprint" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSprintReport = async(req,res)=>{
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const tasks = await Task.find({ sprintId });
    const completedTasks = tasks.filter(t => t.status === "Done");
    const inProgressTasks = tasks.filter(t => t.status === "In Progress");

    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const remainingPoints = totalPoints - completedPoints;

    const report = {
      sprintId,
      sprintName: sprint.name,
      status: sprint.status,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      goal: sprint.goal,
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        notStarted: tasks.filter(t => t.status === "To Do").length
      },
      storyPoints: {
        planned: totalPoints,
        completed: completedPoints,
        remaining: remainingPoints,
        completionPercentage: totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(2) : 0
      },
      velocity: sprint.actualVelocity || 0,
      efficiency: totalPoints > 0 ? ((completedPoints / totalPoints) * 100).toFixed(2) : 0
    };

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};