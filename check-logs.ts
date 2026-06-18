import { connectDB } from "./src/lib/db";
import WhatsappLogModel from "./src/lib/models/WhatsappLog.model";
import mongoose from "mongoose";
import fs from "fs";

function loadEnv() {
  const envFile = fs.readFileSync(".env", "utf8");
  envFile.split("\n").forEach(line => {
    const match = line.match(/^([^#\s]+)\s*=\s*(.*)$/);
    if (match) {
      let key = match[1];
      let value = match[2];
      // remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

async function checkLogs() {
  loadEnv();
  await connectDB();
  const logs = await WhatsappLogModel.find({ messageType: "admin_notification" }).sort({ createdAt: -1 }).limit(3).lean();
  console.log(JSON.stringify(logs, null, 2));
  mongoose.disconnect();
}

checkLogs();
