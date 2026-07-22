import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { connectDB } from "../src/lib/db";
import { resendWhatsAppMessage } from "../src/services/whatsapp.service";
import mongoose from "mongoose";

async function run() {
  try {
    await connectDB();
    console.log("Connected to DB, triggering resend...");
    const result = await resendWhatsAppMessage("6a33bda8460a8863a8745d64");
    console.log("Resend Result:", result);
  } catch (error) {
    console.error("Resend Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

run();
