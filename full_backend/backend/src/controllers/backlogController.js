import Backlog from "../models/Backlog.js";
import Task from "../models/Task.js";

export const getBacklog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sort = "priority", filter } = req.query;

    let query = { projectId, isBacklogged: true };
    if (filter) {
      query.$or = [
        { title: { $regex: filter, $options: "i" } },
        { description: { $regex: filter, $options: "i" } }
      ];
    }

    const backlog = await Backlog.find(query).sort(sort === "priority" ? { priority: -1 } : { createdAt: -1 });
    const tasks = await Task.find({ _id: { $in: backlog.map(b => b.taskId) } });

    res.json({
      backlog,
      tasks,
      count: backlog.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToBacklog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskId } = req.body;

    const backlogItem = new Backlog({ projectId, taskId, order: Date.now() });
    await backlogItem.save();

    await Task.findByIdAndUpdate(taskId, { sprintId: null, status: "Backlog" });

    res.status(201).json(backlogItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reorderBacklog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { items } = req.body;

    for (let i = 0; i < items.length; i++) {
      await Backlog.findByIdAndUpdate(items[i]._id, { order: i });
    }

    res.json({ message: "Backlog reordered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const moveToSprint = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskId, sprintId } = req.body;

    await Backlog.findOneAndDelete({ taskId, projectId });
    await Task.findByIdAndUpdate(taskId, { sprintId, status: "To Do", isBacklogged: false });

    res.json({ message: "Task moved to sprint" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchBacklog = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { q } = req.query;

    const results = await Backlog.find({ projectId }).populate({
      path: "taskId",
      match: { $or: [{ title: { $regex: q, $options: "i" } }, { description: { $regex: q, $options: "i" } }] }
    });

    res.json(results.filter(r => r.taskId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromBacklog = async (req, res) => {
  try {
    const { backlogId } = req.params;
    await Backlog.findByIdAndDelete(backlogId);
    res.json({ message: "Removed from backlog" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
