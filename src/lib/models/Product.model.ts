import { IProduct } from "@/@types/product";
import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: [String],
      default: [],
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    subCategory: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    unit: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    more_details: {
      // Use Schema.Types.Mixed for flexible object structures
      type: Schema.Types.Mixed,
      default: {},
    },
    publish: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    vendorNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ category: 1 });
ProductSchema.index({ subCategory: 1 });
ProductSchema.index({ publish: 1 });

export default (mongoose.models as any).Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
