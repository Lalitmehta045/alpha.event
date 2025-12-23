import mongoose, { Schema } from "mongoose";
import { IUserProfile } from "@/@types/user";

const UserSchema = new Schema<IUserProfile>(
  {
    fname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: null,
    },
    refresh_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    shopping_cart: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["SUPER-ADMIN", "ADMIN", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUserProfile>("User", UserSchema);
