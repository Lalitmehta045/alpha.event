import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGO_URL;

if (!MONGODB_URI) {
  console.error("Please define the MONGO_URL environment variable inside .env");
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({}, { strict: false });
const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    const result = await ProductModel.updateMany(
      { status: { $ne: "approved" }, vendorId: null },
      { $set: { status: "approved" } }
    );
    console.log(`Updated ${result.modifiedCount} products to approved status.`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
