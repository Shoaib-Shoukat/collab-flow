import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "manager", "developer", "qa", "viewer"],
    default: "developer" 
  },
  avatar: String,
  bio: String,
  department: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  permissions: [String],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    slack: { type: Boolean, default: false },
    slackWebhook: String
  },
  projectRoles: [{
    projectId: mongoose.Schema.Types.ObjectId,
    role: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.methods.setPassword = async function(p){
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(p, salt);
};

UserSchema.methods.comparePassword = function(p){
  return bcrypt.compare(p, this.passwordHash);
};

export default mongoose.model("User", UserSchema);
