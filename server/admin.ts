import type { RequestHandler } from "express";
import * as adminStorage from "./adminStorage";

/** Only the single admin email can access changeable admin actions. */
export const isAdmin: RequestHandler = async (req: any, res, next) => {
  const email = req.user?.claims?.email ?? req.user?.email;
  if (!email) return res.status(401).json({ message: "Unauthorized" });
  const ok = await adminStorage.isAdminEmail(email);
  if (!ok) return res.status(403).json({ message: "Admin access only" });
  next();
};

/** Admin or partner (investor/founder) can view metrics and announcements. */
export const isAdminOrPartner: RequestHandler = async (req: any, res, next) => {
  const email = req.user?.claims?.email ?? req.user?.email;
  if (!email) return res.status(401).json({ message: "Unauthorized" });
  const ok = await adminStorage.isAdminOrPartner(email);
  if (!ok) return res.status(403).json({ message: "Admin or partner access required" });
  next();
};
