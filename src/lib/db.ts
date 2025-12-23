import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    // Already connected
    return;
  }

  const MONGO_URL = process.env.MONGO_URL;

  if (!MONGO_URL) {
    throw new Error("❌ MONGO_URL not found in .env.local");
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅DATABASE MongoDB is connected successfully.");
  } catch (error) {
    console.log("❌ DATABASE MongoDB connection error:", error);
    throw error;
  }
}
