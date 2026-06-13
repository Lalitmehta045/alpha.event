import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Subcategory name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Parent category is required"],
    },
  },
  { timestamps: true }
);

// Compound index for uniqueness per category
subCategorySchema.index({ name: 1, category: 1 }, { unique: true });
// Index on category to quickly load subcategories for a given category
subCategorySchema.index({ category: 1 });

export default (mongoose.models as any).SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);
