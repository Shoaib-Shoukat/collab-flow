import Task from "../models/Task.js";
import Notification from "../models/Notification.js";
import Automation from "../models/Automation.js";

export const createTask = async(req,res)=>{
  try {
    const { title, description, projectId, sprintId, assigneeId, storyPoints, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      projectId,
      sprintId,
      assigneeId,
      storyPoints: storyPoints || 0,
      priority: priority || "Medium",
      dueDate,
      createdById: req.user._id,
      status: "To Do"
    });
    
    await task.save();
    await task.populate(["assigneeId", "createdById"]);

    if (assigneeId) {
      const notification = new Notification({
        userId: assigneeId,
        type: "task_assigned",
        title: "Task Assigned",
        message: `You have been assigned to task: ${title}`,
        relatedTo: "task",
        relatedId: task._id,
        priority: "high"
      });
      await notification.save();
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTasks = async(req,res)=>{
  try {
    const { projectId, sprintId, status, assigneeId, priority } = req.query;
    
    let query = {};
    if (projectId) query.projectId = projectId;
    if (sprintId) query.sprintId = sprintId;
    if (status) query.status = status;
    if (assigneeId) query.assigneeId = assigneeId;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate("assigneeId", "name email avatar")
      .populate("createdById", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTaskById = async(req,res)=>{
  try {
    const task = await Task.findById(req.params.id)
      .populate("assigneeId")
      .populate("createdById")
      .populate("dependencies");

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async(req,res)=>{
  try {
    const { id } = req.params;
    const oldTask = await Task.findById(id);
    
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true })
      .populate("assigneeId")
      .populate("createdById");

    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (oldTask[key] !== req.body[key]) {
        changes[key] = { old: oldTask[key], new: req.body[key] };
      }
    });

    await Task.findByIdAndUpdate(id, {
      $push: {
        activityLog: {
          action: "task_updated",
          userId: req.user._id,
          changes: changes,
          timestamp: new Date()
        }
      }
    });

    if (req.body.status && req.body.status !== oldTask.status) {
      if (req.body.status === "Done") {
        await Task.findByIdAndUpdate(id, { completedDate: new Date() });
      }

      const automations = await Automation.find({ 
        projectId: oldTask.projectId,
        trigger: "onStatusChange",
        "triggerConfig.statusTo": req.body.status,
        isActive: true
      });

      for (const automation of automations) {
        for (const action of automation.actions) {
          if (action.type === "notifyUser" && action.config.userId) {
            const notification = new Notification({
              userId: action.config.userId,
              type: "status_change",
              title: "Task Status Changed",
              message: `${oldTask.title} status changed to ${req.body.status}`,
              relatedTo: "task",
              relatedId: id
            });
            await notification.save();
          }
        }
      }
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTask = async(req,res)=>{
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({message:"Task deleted"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addComment = async(req,res)=>{
  try {
    const { id } = req.params;
    const { text } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { comments: { userId: req.user._id, text, createdAt: new Date() } } },
      { new: true }
    ).populate("comments.userId", "name email avatar");

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAttachment = async(req,res)=>{
  try {
    const { id } = req.params;
    const { fileName, filePath } = req.body;

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { attachments: { fileName, filePath, uploadedBy: req.user._id } } },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const watchTask = async(req,res)=>{
  try {
    const { id } = req.params;
    
    const task = await Task.findByIdAndUpdate(
      id,
      { $addToSet: { watchers: req.user._id } },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unwatchTask = async(req,res)=>{
  try {
    const { id } = req.params;
    
    const task = await Task.findByIdAndUpdate(
      id,
      { $pull: { watchers: req.user._id } },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchTasks = async(req,res)=>{
  try {
    const { q, projectId } = req.query;

    const tasks = await Task.find({
      projectId,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ]
    }).populate("assigneeId", "name email");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};