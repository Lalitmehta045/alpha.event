import mongoose, { Schema } from "mongoose";
import { IOrder } from "@/@types/order";

const PaymentStatus = {
  PAID: "PAID",
  PENDING: "PENDING",
  COD: "COD",
} as const;
// Define the type for the product details within the order

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        product_details: {
          name: { type: String, required: true },
          image: [String],
        },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    delivery_address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    subTotalAmt: {
      type: Number,
      default: 0,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      enum: ["Processing", "Request", "Accepted", "Cancelled"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

export default (mongoose.models as any).Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
