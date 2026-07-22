import { connectDB } from "../src/lib/db";
import WhatsappLogModel from "../src/lib/models/WhatsappLog.model";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function run() {
  await connectDB();
  const logs = await WhatsappLogModel.find({ status: "failed" }).sort({ createdAt: -1 }).limit(5).lean();
  console.log(JSON.stringify(logs, null, 2));
  mongoose.connection.close();
}

run();
