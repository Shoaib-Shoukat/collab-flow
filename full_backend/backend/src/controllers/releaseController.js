import Release from "../models/Release.js";
import Task from "../models/Task.js";
import Bug from "../models/Bug.js";

export const createRelease = async (req, res) => {
  try {
    const { projectId, version, name, releaseDate, description } = req.body;

    const release = new Release({
      projectId,
      version,
      name: name || `v${version}`,
      releaseDate,
      description,
      releaseManager: req.user._id
    });

    await release.save();
    res.status(201).json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReleases = async (req, res) => {
  try {
    const { projectId } = req.params;
    const releases = await Release.find({ projectId }).populate("releaseManager", "name email");
    res.json(releases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReleaseById = async (req, res) => {
  try {
    const { releaseId } = req.params;
    const release = await Release.findById(releaseId)
      .populate("releaseManager", "name email")
      .populate("tasks")
      .populate("bugsFixes");

    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRelease = async (req, res) => {
  try {
    const { releaseId } = req.params;
    const release = await Release.findByIdAndUpdate(releaseId, req.body, { new: true });
    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addMilestone = async (req, res) => {
  try {
    const { releaseId } = req.params;
    const { title, description, targetDate } = req.body;

    const release = await Release.findByIdAndUpdate(
      releaseId,
      { $push: { milestones: { title, description, targetDate, status: "Pending" } } },
      { new: true }
    );

    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeMilestone = async (req, res) => {
  try {
    const { releaseId, milestoneIndex } = req.params;

    const release = await Release.findById(releaseId);
    release.milestones[milestoneIndex].status = "Completed";
    release.milestones[milestoneIndex].completedDate = new Date();
    await release.save();

    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addTaskToRelease = async (req, res) => {
  try {
    const { releaseId } = req.params;
    const { taskId } = req.body;

    const release = await Release.findByIdAndUpdate(
      releaseId,
      { $addToSet: { tasks: taskId } },
      { new: true }
    );

    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addBugFixToRelease = async (req, res) => {
  try {
    const { releaseId } = req.params;
    const { bugId } = req.body;

    const release = await Release.findByIdAndUpdate(
      releaseId,
      { $addToSet: { bugsFixes: bugId } },
      { new: true }
    );

    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const publishRelease = async (req, res) => {
  try {
    const { releaseId } = req.params;
    const { changelog, releaseNotes } = req.body;

    const release = await Release.findByIdAndUpdate(
      releaseId,
      { 
        status: "Released", 
        releaseDate: new Date(),
        changelog,
        releaseNotes
      },
      { new: true }
    );

    res.json(release);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRelease = async (req, res) => {
  try {
    const { releaseId } = req.params;
    await Release.findByIdAndDelete(releaseId);
    res.json({ message: "Release deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
