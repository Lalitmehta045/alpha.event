import { Types } from "mongoose";
import { IProduct } from "./product";
import { IUserProfile } from "./user";

export interface CartItem {
  _id: string;
  quantity: number;
  product: {
    _id?: string;
    name: string;
    image?: string;
    category: Array<string>;
    subCategory: Array<string>;
    unit: string;
    stock: number;
    price: number;
    discount?: number | any;
    quantity: number;
    description: string;
    more_details?: Record<string, string>;
  };
}

export interface ICart extends Document {
  productId: Types.ObjectId | IProduct;
  quantity: number;
  userId: Types.ObjectId | IUserProfile;
}
