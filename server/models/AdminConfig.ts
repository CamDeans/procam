import mongoose from "mongoose";

/** Single document: admin email (only one can change config), partner emails, split %, first-year payout %. */
export interface IAdminConfigDoc extends mongoose.Document {
  adminEmail: string;
  partnerEmails: string[];
  splitAdminPct: number;
  splitPartnerPct: number;
  splitScalingPct: number;
  firstYearPayoutPct: number;
  updatedAt: Date;
}

const adminConfigSchema = new mongoose.Schema<IAdminConfigDoc>(
  {
    adminEmail: { type: String, required: true },
    partnerEmails: { type: [String], default: [] },
    splitAdminPct: { type: Number, default: 35 },
    splitPartnerPct: { type: Number, default: 35 },
    splitScalingPct: { type: Number, default: 30 },
    firstYearPayoutPct: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const AdminConfigModel =
  mongoose.models?.AdminConfig ?? mongoose.model<IAdminConfigDoc>("AdminConfig", adminConfigSchema);
