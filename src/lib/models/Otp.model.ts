import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1 });
// ✅ Auto-delete in 5 minutes using a proper TTL index
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.models.OTP || mongoose.model("OTP", otpSchema);
