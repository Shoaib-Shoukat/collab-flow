import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { 
    type: String, 
    enum: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
    default: "To Do"
  },
  priority: { 
    type: String, 
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  storyPoints: { type: Number, min: 0, default: 0 },
  sprintId: mongoose.Schema.Types.ObjectId,
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  assigneeId: mongoose.Schema.Types.ObjectId,
  createdById: { type: mongoose.Schema.Types.ObjectId, required: true },
  watchers: [mongoose.Schema.Types.ObjectId],
  dependencies: [mongoose.Schema.Types.ObjectId],
  labels: [String],
  comments: [{
    userId: mongoose.Schema.Types.ObjectId,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: mongoose.Schema.Types.ObjectId
  }],
  startDate: Date,
  dueDate: Date,
  completedDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  burndownData: [{
    date: Date,
    remainingPoints: Number
  }],
  activityLog: [{
    action: String,
    userId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Task", TaskSchema);