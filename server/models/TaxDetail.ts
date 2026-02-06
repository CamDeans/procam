import mongoose from "mongoose";

/** Tax details for admin/investors (stored per user email). */
export interface ITaxDetailDoc extends mongoose.Document {
  userEmail: string;
  fullName?: string;
  taxId?: string;
  address?: string;
  country?: string;
  updatedAt: Date;
}

const taxDetailSchema = new mongoose.Schema<ITaxDetailDoc>(
  {
    userEmail: { type: String, required: true, unique: true },
    fullName: String,
    taxId: String,
    address: String,
    country: String,
  },
  { timestamps: true }
);

export const TaxDetailModel =
  mongoose.models?.TaxDetail ?? mongoose.model<ITaxDetailDoc>("TaxDetail", taxDetailSchema);
