import {
  AdminConfigModel,
  AnnouncementModel,
  TaxDetailModel,
  WithdrawalRequestModel,
  AppLogModel,
  UserModel,
} from "./models";
import type { WithdrawalStatus } from "./models/WithdrawalRequest";

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@procam.cloud";

export interface AdminConfigData {
  adminEmail: string;
  partnerEmails: string[];
  splitAdminPct: number;
  splitPartnerPct: number;
  splitScalingPct: number;
  firstYearPayoutPct: number;
}

export async function getAdminConfig(): Promise<AdminConfigData> {
  let doc = await AdminConfigModel.findOne().lean() as AdminConfigData | null;
  if (!doc) {
    const created = await AdminConfigModel.create({
      adminEmail: DEFAULT_ADMIN_EMAIL,
      partnerEmails: [],
      splitAdminPct: 35,
      splitPartnerPct: 35,
      splitScalingPct: 30,
      firstYearPayoutPct: 10,
    });
    doc = {
      adminEmail: created.adminEmail,
      partnerEmails: created.partnerEmails ?? [],
      splitAdminPct: created.splitAdminPct ?? 35,
      splitPartnerPct: created.splitPartnerPct ?? 35,
      splitScalingPct: created.splitScalingPct ?? 30,
      firstYearPayoutPct: created.firstYearPayoutPct ?? 10,
    };
  }
  return doc;
}

export async function isAdminEmail(email: string): Promise<boolean> {
  const config = await getAdminConfig();
  return config.adminEmail.toLowerCase() === email?.toLowerCase();
}

export async function isPartnerEmail(email: string): Promise<boolean> {
  const config = await getAdminConfig();
  return (config.partnerEmails ?? []).some((e: string) => e.toLowerCase() === email?.toLowerCase());
}

export async function isAdminOrPartner(email: string): Promise<boolean> {
  return (await isAdminEmail(email)) || (await isPartnerEmail(email));
}

export async function updateAdminConfig(updates: {
  adminEmail?: string;
  partnerEmails?: string[];
  splitAdminPct?: number;
  splitPartnerPct?: number;
  splitScalingPct?: number;
  firstYearPayoutPct?: number;
}) {
  const doc = await AdminConfigModel.findOneAndUpdate({}, { $set: updates }, { new: true }).lean();
  return doc;
}

// Announcements
export async function listAnnouncements(limit = 50) {
  return AnnouncementModel.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function createAnnouncement(authorEmail: string, title: string, body: string) {
  return AnnouncementModel.create({ authorEmail, title, body });
}

// Tax details (per admin/investor email)
export async function getTaxDetail(userEmail: string) {
  return TaxDetailModel.findOne({ userEmail: userEmail.toLowerCase() }).lean();
}

export async function upsertTaxDetail(
  userEmail: string,
  data: { fullName?: string; taxId?: string; address?: string; country?: string }
) {
  return TaxDetailModel.findOneAndUpdate(
    { userEmail: userEmail.toLowerCase() },
    { $set: { ...data, updatedAt: new Date() } },
    { new: true, upsert: true }
  ).lean();
}

// Withdrawals
export async function listWithdrawalRequests(limit = 50) {
  return WithdrawalRequestModel.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function createWithdrawalRequest(requestedByEmail: string, amountCents: number, reason?: string) {
  return WithdrawalRequestModel.create({
    requestedByEmail,
    amountCents,
    reason,
    status: "pending",
  });
}

export async function confirmWithdrawalAsAdmin(id: string, adminEmail: string) {
  const req = await WithdrawalRequestModel.findOne({ _id: id });
  if (!req) return null;
  const config = await getAdminConfig();
  if (config.adminEmail.toLowerCase() !== adminEmail?.toLowerCase()) return null;
  const status: WithdrawalStatus = req.partnerConfirmedAt ? "dual_confirmed" : "admin_confirmed";
  req.status = status;
  req.adminConfirmedAt = new Date();
  await req.save();
  await appendAppLog("info", "Withdrawal admin confirmed", { id, status, by: adminEmail });
  return req.toObject();
}

export async function confirmWithdrawalAsPartner(id: string, partnerEmail: string) {
  const req = await WithdrawalRequestModel.findOne({ _id: id });
  if (!req) return null;
  const isPartner = await isPartnerEmail(partnerEmail);
  if (!isPartner) return null;
  const status: WithdrawalStatus = req.adminConfirmedAt ? "dual_confirmed" : "partner_confirmed";
  req.status = status;
  req.partnerConfirmedAt = new Date();
  await req.save();
  await appendAppLog("info", "Withdrawal partner confirmed", { id, status, by: partnerEmail });
  return req.toObject();
}

export async function executeWithdrawal(id: string, adminEmail: string) {
  const req = await WithdrawalRequestModel.findOne({ _id: id });
  if (!req) return null;
  const isAdmin = await isAdminEmail(adminEmail);
  if (!isAdmin || req.status !== "dual_confirmed") return null;
  req.status = "executed";
  req.executedAt = new Date();
  await req.save();
  await appendAppLog("info", "Withdrawal executed", { id, amountCents: req.amountCents, by: adminEmail });
  return req.toObject();
}

// App logs
export async function listAppLogs(limit = 200) {
  return AppLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function appendAppLog(level: string, message: string, meta?: Record<string, unknown>) {
  return AppLogModel.create({ level, message, meta });
}

// Metrics (users, subscriptions from DB)
export async function getMetrics() {
  const totalUsers = await UserModel.countDocuments();
  const usersWithSubscription = await UserModel.countDocuments({ stripeSubscriptionId: { $exists: true, $ne: null } });
  return { totalUsers, usersWithSubscription };
}
