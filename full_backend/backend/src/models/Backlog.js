import mongoose from "mongoose";

const BacklogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, required: true },
  order: { type: Number, default: 0 },
  isBacklogged: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

BacklogSchema.index({ projectId: 1, order: 1 });

export default mongoose.model("Backlog", BacklogSchema);
