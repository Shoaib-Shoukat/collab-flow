import mongoose from "mongoose";

const AutomationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  trigger: {
    type: String,
    enum: ["onStatusChange", "dueDateApproaching", "criticalBugAlert", "taskAssigned", "sprintStart", "sprintEnd"],
    required: true
  },
  triggerConfig: {
    status: String,
    statusFrom: String,
    statusTo: String,
    daysBeforeDue: Number,
    severity: String
  },
  actions: [{
    type: String,
    enum: ["moveTask", "notifyUser", "broadcastAlert", "assignTask", "addLabel", "changeStatus"],
    config: mongoose.Schema.Types.Mixed
  }],
  conditions: [{
    field: String,
    operator: String,
    value: mongoose.Schema.Types.Mixed
  }],
  executionHistory: [{
    triggeredAt: Date,
    status: String,
    taskId: mongoose.Schema.Types.ObjectId,
    actionsExecuted: [String],
    errors: [String]
  }],
  createdById: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Automation", AutomationSchema);
