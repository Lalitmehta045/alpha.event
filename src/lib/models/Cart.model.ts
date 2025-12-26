import mongoose, { Schema } from "mongoose";
import { ICart } from "@/@types/cart";

const CartSchema = new Schema<ICart>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default (mongoose.models as any).Cart ||
  mongoose.model<ICart>("Cart", CartSchema);
