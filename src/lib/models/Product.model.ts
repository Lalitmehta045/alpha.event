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
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
