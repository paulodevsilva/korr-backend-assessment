import mongoose, { Document, Schema } from "mongoose";

export interface IClaim extends Document {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: Date;
  totalAmount: number;
  diagnosisCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    claimId: { type: String, required: true, unique: true },
    memberId: { type: String, required: true },
    provider: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    diagnosisCodes: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const ClaimModel = mongoose.model<IClaim>("Claim", ClaimSchema);
