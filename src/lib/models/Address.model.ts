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

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
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
    recipient_name: {
      type: String,
      trim: true,
      default: null,
    },
    map_url: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1 });

export default (mongoose.models as any).Address ||
  mongoose.model<IAddress>("Address", AddressSchema);
