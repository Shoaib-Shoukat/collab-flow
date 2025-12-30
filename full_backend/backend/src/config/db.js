import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri, { dbName: "collabflow" });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo error", err);
    process.exit(1);
  }
};
export default connectDB;