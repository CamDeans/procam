import mongoose from "mongoose";

export type WithdrawalStatus = "pending" | "admin_confirmed" | "partner_confirmed" | "dual_confirmed" | "executed" | "rejected";

export interface IWithdrawalRequestDoc extends mongoose.Document {
  requestedByEmail: string;
  amountCents: number;
  reason?: string;
  status: WithdrawalStatus;
  adminConfirmedAt?: Date;
  partnerConfirmedAt?: Date;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalRequestSchema = new mongoose.Schema<IWithdrawalRequestDoc>(
  {
    requestedByEmail: { type: String, required: true },
    amountCents: { type: Number, required: true },
    reason: String,
    status: { type: String, enum: ["pending", "admin_confirmed", "partner_confirmed", "dual_confirmed", "executed", "rejected"], default: "pending" },
    adminConfirmedAt: Date,
    partnerConfirmedAt: Date,
    executedAt: Date,
  },
  { timestamps: true }
);

export const WithdrawalRequestModel =
  mongoose.models?.WithdrawalRequest ?? mongoose.model<IWithdrawalRequestDoc>("WithdrawalRequest", withdrawalRequestSchema);
