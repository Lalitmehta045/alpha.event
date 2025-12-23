import mongoose from "mongoose";
import { Types } from "mongoose";
import { Category, SubCategory } from "./catregory";

// Base product fields (used by both Product and NewProduct)
export interface ProductBase {
  name: string;
  image: string[];
  // Fix: When sending data, we use the string IDs
  category: string[];
  subCategory: string[];
  unit: string;
  stock: number;
  price: number;
  description: string;
  more_details?: Record<string, string>;
}

// Product received from database (always has _id)
export interface Product {
  _id: string;
  name: string;
  image: string[];
  category: Category[]; // Back-end returns full objects
  subCategory: SubCategory[]; // Back-end returns full objects
  unit: string;
  stock: number;
  price: number;
  description: string;
  more_details?: Record<string, string>;
  discount: number;
}

// Product sent to backend when creating a new product
export interface NewProduct extends ProductBase {
  _id?: string; // optional
  discount?: number;
}

// 1. Product Form Values (Used by useForm - requires full objects for UI chips)
export interface ProductFormValues {
  _id?: string;
  name: string;
  image: string[];
  category: Category[]; // MUST be Category[] for UI
  subCategory: SubCategory[]; // MUST be SubCategory[] for UI
  unit: string;
  stock: number;
  price: number;
  discount: number;
  description: string;
  more_details?: Record<string, string>;
}

// 2. Product API Payload (Used by editProduct - requires ONLY IDs for MongoDB)
export interface ProductAPIPayload
  extends Omit<ProductFormValues, "category" | "subCategory"> {
  category: string[]; // Changed to array of IDs
  subCategory: string[]; // Changed to array of IDs
}

export interface IProduct extends Document {
  name: string;
  image: string[]; // Array of image URLs
  category: (Types.ObjectId | Category)[];
  subCategory: (Types.ObjectId | SubCategory)[];
  unit?: string;
  stock: number;
  price: number;
  discount: number;
  description?: string;
  more_details: mongoose.Schema.Types.Mixed;
  publish: boolean;
  createdAt: Date;
  updatedAt: Date;
}
