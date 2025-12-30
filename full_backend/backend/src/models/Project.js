import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  description: String,
  image: String,
  leaderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  members: [mongoose.Schema.Types.ObjectId],
  isPublic: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["Active", "Archived", "Planning"],
    default: "Active"
  },
  category: String,
  startDate: Date,
  endDate: Date,
  settings: {
    allowPublicComments: { type: Boolean, default: false },
    notifyOnMentions: { type: Boolean, default: true },
    requireAttachmentOnClose: { type: Boolean, default: false }
  },
  stats: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    totalBugs: { type: Number, default: 0 },
    openBugs: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);
