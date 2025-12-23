import { Types } from "mongoose";
import { IAddress } from "./address";
import { IUserProfile } from "./user";
import { IProduct } from "./product";

const PaymentStatus = {
  PAID: "PAID",
  PENDING: "PENDING",
  COD: "COD",
} as const;

// Define the type for a single product entry in the order's products array
export interface IOrderProduct {
  productId?: Types.ObjectId | IProduct; // Can be just an ID or a populated Product document
  quantity: number;
}

// Main Order Document Interface
export interface IOrder extends Document {
  userId: Types.ObjectId | IUserProfile; // Can be just an ID or a populated User document
  orderId: string;
  products: IOrderProduct[]; // Array of product entries
  paymentId?: string;
  payment_status: (typeof PaymentStatus)[keyof typeof PaymentStatus]; // Type for enum string
  delivery_address: Types.ObjectId | IAddress; // Can be just an ID or a populated Address document
  subTotalAmt: number;
  totalAmt: number;
  invoice_receipt?: string;
  order_status: "Processing" | "Request" | "Accepted" | "Cancelled"; // Type for enum string
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminOrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  payment?: string;
  search?: string; // For orderId search
}

// Define the response structure matching your backend API
export interface AdminOrderResponse {
  success: boolean;
  message: string;
  page: number;
  totalPages: number;
  totalOrders: number;
  data: any[]; // The array of order documents
}

// Define the detailed data structure expected from the API response
interface ProductDetails {
  _id: string;
  name: string;
  price: number;
  discount: number;
  // ... other product fields
}

interface OrderProduct {
  _id: string;
  productId: IProduct;
  quantity: number;
  // ... other product-in-order fields
}

interface UserDetails {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  phone: number;
  role: string;
  // ... other user fields
}

export interface DeliveryAddress {
  _id: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobile: string;
  // ... other address fields
}

export interface DetailedOrderData {
  _id: string;
  userId: UserDetails;
  orderId: string;
  products: OrderProduct[];
  totalAmt: number;
  order_status: string;
  payment_status: string;
  delivery_address: DeliveryAddress;
  subTotalAmt: number;
  invoice_receipt: string;
  createdAt: Date;
  updatedAt: Date;
  // ... all other fields from the JSON response
}

export const ORDER_STATUSES = [
  "Processing",
  "Request",
  "Accepted",
  "Cancelled",
];
