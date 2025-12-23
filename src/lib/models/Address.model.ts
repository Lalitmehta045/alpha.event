import { IAddress } from "@/@types/address";
import mongoose, { Schema } from "mongoose";

const AddressSchema = new Schema<IAddress>(
  {
    address_line: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Invalid Indian pincode format"],
    },
    country: {
      type: String,
      default: "India",
    },
    mobile: {
      type: String,
      trim: true,
      default: null,
      match: [/^[+\d][\d\s\-()]*$/, "Invalid mobile number format"],
    },

    status: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Address ||
  mongoose.model<IAddress>("Address", AddressSchema);
