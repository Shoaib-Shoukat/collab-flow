import mongoose from "mongoose";

const BugSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  severity: { 
    type: String, 
    enum: ["Critical", "High", "Medium", "Low"],
    default: "Medium"
  },
  priority: {
    type: String,
    enum: ["P0", "P1", "P2", "P3"],
    default: "P2"
  },
  reproducible: { type: Boolean, default: false },
  steps: String,
  expectedBehavior: String,
  actualBehavior: String,
  status: { 
    type: String, 
    enum: ["Open", "In Progress", "Resolved", "Closed", "Reopened"],
    default: "Open"
  },
  resolution: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sprintId: mongoose.Schema.Types.ObjectId,
  assigneeId: mongoose.Schema.Types.ObjectId,
  createdById: { type: mongoose.Schema.Types.ObjectId, required: true },
  watchers: [mongoose.Schema.Types.ObjectId],
  tags: [String],
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: mongoose.Schema.Types.ObjectId
  }],
  comments: [{
    userId: mongoose.Schema.Types.ObjectId,
    text: String,
    attachments: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  environment: String,
  browserVersion: String,
  affectedUsers: Number,
  relatedTasks: [mongoose.Schema.Types.ObjectId],
  activityLog: [{
    action: String,
    userId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Bug", BugSchema);