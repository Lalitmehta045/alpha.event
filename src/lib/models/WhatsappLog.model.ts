import mongoose, { Schema, Document } from "mongoose";

export interface IWhatsappLog extends Document {
  orderId: string;
  recipient: string;
  messageType: "admin_notification" | "customer_order_received" | "customer_confirmation";
  message: string;
  status: "sent" | "failed" | "pending";
  response: any;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsappLogSchema = new Schema<IWhatsappLog>(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["admin_notification", "customer_order_received", "customer_confirmation"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    response: {
      type: Schema.Types.Mixed,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

WhatsappLogSchema.index({ orderId: 1, createdAt: -1 });

export default (mongoose.models as any).WhatsappLog ||
  mongoose.model<IWhatsappLog>("WhatsappLog", WhatsappLogSchema);
