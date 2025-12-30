import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: {
    type: String,
    enum: ["task_assigned", "task_updated", "bug_created", "bug_assigned", "sprint_started", "sprint_ended", "mention", "comment", "status_change"],
    required: true
  },
  title: String,
  message: { type: String, required: true },
  relatedTo: {
    type: String,
    enum: ["task", "bug", "sprint", "project"]
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  read: { type: Boolean, default: false },
  readAt: Date,
  actionUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 30*24*60*60*1000) }
}, { timestamps: true });

NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Notification", NotificationSchema);
