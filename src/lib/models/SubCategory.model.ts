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

export default mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);
