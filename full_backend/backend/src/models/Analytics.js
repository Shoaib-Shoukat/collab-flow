import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sprintId: mongoose.Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  metrics: {
    cycleTime: Number,
    leadTime: Number,
    velocity: Number,
    sprintCompletionScore: Number,
    burndownRate: Number,
    defectRate: Number
  },
  taskMetrics: {
    totalTasks: Number,
    completedTasks: Number,
    inProgressTasks: Number,
    blockedTasks: Number,
    overdueTasks: Number
  },
  bugMetrics: {
    totalBugs: Number,
    criticalBugs: Number,
    highBugs: Number,
    mediumBugs: Number,
    lowBugs: Number,
    resolvedBugs: Number
  },
  teamMetrics: {
    totalMembers: Number,
    activeMembers: Number,
    tasksPerMember: [
      {
        memberId: mongoose.Schema.Types.ObjectId,
        count: Number,
        completed: Number
      }
    ]
  },
  trendData: [{
    timestamp: Date,
    value: Number,
    label: String
  }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Analytics", AnalyticsSchema);
