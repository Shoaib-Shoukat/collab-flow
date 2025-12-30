import mongoose from "mongoose";

const SprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["Planned", "Active", "Completed", "Archived"],
    default: "Planned"
  },
  goal: String,
  tasks: [mongoose.Schema.Types.ObjectId],
  plannedVelocity: { type: Number, default: 0 },
  actualVelocity: { type: Number, default: 0 },
  completedPoints: { type: Number, default: 0 },
  remainingPoints: { type: Number, default: 0 },
  teamMembers: [mongoose.Schema.Types.ObjectId],
  burndownChart: [{
    day: Number,
    plannedPoints: Number,
    actualPoints: Number,
    date: Date
  }],
  retrospectiveNotes: String,
  metrics: {
    completionPercentage: { type: Number, default: 0 },
    cycleTime: Number,
    leadTime: Number,
    defectRate: Number
  },
  createdById: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Sprint", SprintSchema);