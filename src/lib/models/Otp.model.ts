import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: Number, required: true },
  },
  {
    timestamps: true,
    expires: 300, // ✅ Auto-delete in 5 minutes
  }
);

export default mongoose.models.OTP || mongoose.model("OTP", otpSchema);
