import Bug from "../models/Bug.js";
import Notification from "../models/Notification.js";
import Automation from "../models/Automation.js";

export const createBug = async(req,res)=>{
  try {
    const { title, description, severity, projectId, sprintId, assigneeId, steps, reproducible } = req.body;

    const bug = new Bug({
      title,
      description,
      severity: severity || "Medium",
      priority: severity === "Critical" ? "P0" : severity === "High" ? "P1" : "P2",
      projectId,
      sprintId,
      assigneeId,
      steps,
      reproducible: reproducible || false,
      createdById: req.user._id,
      status: "Open"
    });

    await bug.save();
    await bug.populate(["assigneeId", "createdById"]);

    if (severity === "Critical") {
      const automations = await Automation.find({
        projectId,
        trigger: "criticalBugAlert",
        isActive: true
      });

      for (const automation of automations) {
        for (const action of automation.actions) {
          if (action.type === "broadcastAlert") {
            const notification = new Notification({
              userId: action.config.userId,
              type: "critical_bug",
              title: "Critical Bug Alert",
              message: `Critical bug reported: ${title}`,
              relatedTo: "bug",
              relatedId: bug._id,
              priority: "high"
            });
            await notification.save();
          }
        }
      }
    }

    if (assigneeId) {
      const notification = new Notification({
        userId: assigneeId,
        type: "bug_assigned",
        title: "Bug Assigned",
        message: `You have been assigned to bug: ${title}`,
        relatedTo: "bug",
        relatedId: bug._id,
        priority: severity === "Critical" ? "high" : "medium"
      });
      await notification.save();
    }

    res.status(201).json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBugs = async(req,res)=>{
  try {
    const { projectId, status, severity, assigneeId, sprintId } = req.query;

    let query = {};
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (assigneeId) query.assigneeId = assigneeId;
    if (sprintId) query.sprintId = sprintId;

    const bugs = await Bug.find(query)
      .populate("assigneeId", "name email avatar")
      .populate("createdById", "name email")
      .sort({ createdAt: -1 });

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBugById = async(req,res)=>{
  try {
    const bug = await Bug.findById(req.params.id)
      .populate("assigneeId")
      .populate("createdById")
      .populate("comments.userId", "name email avatar");

    if (!bug) return res.status(404).json({ error: "Bug not found" });
    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBug = async(req,res)=>{
  try {
    const { id } = req.params;
    const oldBug = await Bug.findById(id);

    const updatedBug = await Bug.findByIdAndUpdate(id, req.body, {new:true})
      .populate("assigneeId")
      .populate("createdById");

    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (oldBug[key] !== req.body[key]) {
        changes[key] = { old: oldBug[key], new: req.body[key] };
      }
    });

    await Bug.findByIdAndUpdate(id, {
      $push: {
        activityLog: {
          action: "bug_updated",
          userId: req.user._id,
          changes: changes,
          timestamp: new Date()
        }
      }
    });

    if (req.body.status && req.body.status !== oldBug.status) {
      if (req.body.status === "Resolved" || req.body.status === "Closed") {
        if (oldBug.assigneeId) {
          const notification = new Notification({
            userId: oldBug.assigneeId,
            type: "bug_resolved",
            title: "Bug Resolved",
            message: `Bug ${oldBug.title} has been marked as ${req.body.status}`,
            relatedTo: "bug",
            relatedId: id
          });
          await notification.save();
        }
      }
    }

    res.json(updatedBug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBug = async(req,res)=>{
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({message:"Bug deleted"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addCommentToBug = async(req,res)=>{
  try {
    const { id } = req.params;
    const { text } = req.body;

    const bug = await Bug.findByIdAndUpdate(
      id,
      { $push: { comments: { userId: req.user._id, text, createdAt: new Date() } } },
      { new: true }
    ).populate("comments.userId", "name email avatar");

    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAttachmentToBug = async(req,res)=>{
  try {
    const { id } = req.params;
    const { fileName, filePath, fileType } = req.body;

    const bug = await Bug.findByIdAndUpdate(
      id,
      { $push: { attachments: { fileName, filePath, fileType, uploadedBy: req.user._id } } },
      { new: true }
    );

    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const watchBug = async(req,res)=>{
  try {
    const { id } = req.params;

    const bug = await Bug.findByIdAndUpdate(
      id,
      { $addToSet: { watchers: req.user._id } },
      { new: true }
    );

    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unwatchBug = async(req,res)=>{
  try {
    const { id } = req.params;

    const bug = await Bug.findByIdAndUpdate(
      id,
      { $pull: { watchers: req.user._id } },
      { new: true }
    );

    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchBugs = async(req,res)=>{
  try {
    const { q, projectId } = req.query;

    const bugs = await Bug.find({
      projectId,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { steps: { $regex: q, $options: "i" } }
      ]
    }).populate("assigneeId", "name email");

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBugStats = async(req,res)=>{
  try {
    const { projectId } = req.params;

    const bugs = await Bug.find({ projectId });

    const stats = {
      total: bugs.length,
      critical: bugs.filter(b => b.severity === "Critical").length,
      high: bugs.filter(b => b.severity === "High").length,
      medium: bugs.filter(b => b.severity === "Medium").length,
      low: bugs.filter(b => b.severity === "Low").length,
      open: bugs.filter(b => b.status === "Open" || b.status === "Reopened").length,
      resolved: bugs.filter(b => b.status === "Resolved" || b.status === "Closed").length,
      inProgress: bugs.filter(b => b.status === "In Progress").length,
      reproducible: bugs.filter(b => b.reproducible).length,
      nonReproducible: bugs.filter(b => !b.reproducible).length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};