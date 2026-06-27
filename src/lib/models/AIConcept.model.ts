import mongoose, { Schema, Document } from "mongoose";

export interface IAIConcept extends Document {
  eventType: string;
  venueType: string;
  guestCount: string;
  themeColors: string[];
  budget: number;
  promptUsed: string;
  variationAUrl: string;
  variationBUrl: string;
  createdAt: Date;
  userId?: string;
}

const AIConceptSchema = new Schema<IAIConcept>(
  {
    eventType: { type: String, required: true },
    venueType: { type: String, required: true },
    guestCount: { type: String, required: true },
    themeColors: { type: [String], required: true },
    budget: { type: Number, required: true },
    promptUsed: { type: String, required: true },
    variationAUrl: { type: String, required: true },
    variationBUrl: { type: String, required: true },
    userId: { type: String, required: false },
  },
  { timestamps: true }
);

export default (mongoose.models as any).AIConcept ||
  mongoose.model<IAIConcept>("AIConcept", AIConceptSchema);
