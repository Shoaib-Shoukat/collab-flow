import mongoose from "mongoose";

const ReleaseSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  version: { type: String, required: true },
  name: String,
  description: String,
  releaseDate: Date,
  status: {
    type: String,
    enum: ["Planning", "Active", "Released", "Archived"],
    default: "Planning"
  },
  milestones: [{
    title: String,
    description: String,
    targetDate: Date,
    status: { type: String, enum: ["Pending", "In Progress", "Completed"] },
    completedDate: Date
  }],
  tasks: [mongoose.Schema.Types.ObjectId],
  bugsFixes: [mongoose.Schema.Types.ObjectId],
  features: [String],
  releaseNotes: String,
  changelog: String,
  releaseManager: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Release", ReleaseSchema);
