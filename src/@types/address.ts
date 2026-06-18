import { Types, Document } from "mongoose";
import { IUserProfile } from "./user";

export interface AddressType {
  _id?: string; // ✔ backend id field
  address_line: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobile?: string | number;
  status: boolean; // ✔ MUST be boolean
  location?: { lat: number; lng: number };
  recipient_name?: string;
  map_url?: string;
}
export interface AddressState {
  addressList: AddressType[];
  loading: false;
}

export interface IAddress extends Document {
  address_line: string; // Renamed from address_line for clarity (as per typical forms)
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile?: string; // Optional as per schema default
  location?: { lat: number; lng: number };
  status: boolean;
  userId: Types.ObjectId | IUserProfile; // Can be just an ID or a populated User document
  recipient_name?: string;
  map_url?: string;
}
