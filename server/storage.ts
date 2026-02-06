import type { Preset, GalleryItem, InsertPreset, InsertGalleryItem } from "@shared/schema";
import type { User } from "@shared/models/auth";
import { UserModel, PresetModel, GalleryModel } from "./models";

function toPreset(doc: { _id: { toString(): string }; userId: string; name: string; settings: Record<string, unknown>; createdAt: Date }): Preset {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    settings: doc.settings,
    createdAt: doc.createdAt,
  };
}

function toGalleryItem(doc: {
  _id: { toString(): string };
  userId: string;
  url: string;
  originalUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}): GalleryItem {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    url: doc.url,
    originalUrl: doc.originalUrl ?? null,
    thumbnailUrl: doc.thumbnailUrl ?? null,
    metadata: doc.metadata ?? null,
    createdAt: doc.createdAt,
  };
}

function toUser(doc: {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: doc.id,
    email: doc.email ?? null,
    firstName: doc.firstName ?? null,
    lastName: doc.lastName ?? null,
    profileImageUrl: doc.profileImageUrl ?? null,
    stripeCustomerId: doc.stripeCustomerId ?? null,
    stripeSubscriptionId: doc.stripeSubscriptionId ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export interface IStorage {
  getPresets(userId: string): Promise<Preset[]>;
  createPreset(preset: InsertPreset & { userId: string }): Promise<Preset>;
  deletePreset(id: string, userId: string): Promise<void>;

  getGallery(userId: string): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem & { userId: string }): Promise<GalleryItem>;
  deleteGalleryItem(id: string, userId: string): Promise<void>;

  getUser(id: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getPresets(userId: string): Promise<Preset[]> {
    const docs = await PresetModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => toPreset(d as any));
  }

  async createPreset(preset: InsertPreset & { userId: string }): Promise<Preset> {
    const doc = await PresetModel.create({ ...preset });
    return toPreset(doc.toObject());
  }

  async deletePreset(id: string, userId: string): Promise<void> {
    const { mongoose } = await import("./db");
    const filter = mongoose.Types.ObjectId.isValid(id) && id.length === 24 ? { _id: new mongoose.Types.ObjectId(id), userId } : { _id: id, userId };
    await PresetModel.deleteOne(filter);
  }

  async getGallery(userId: string): Promise<GalleryItem[]> {
    const docs = await GalleryModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map((d) => toGalleryItem(d as any));
  }

  async createGalleryItem(item: InsertGalleryItem & { userId: string }): Promise<GalleryItem> {
    const doc = await GalleryModel.create({ ...item });
    return toGalleryItem(doc.toObject());
  }

  async deleteGalleryItem(id: string, userId: string): Promise<void> {
    const { mongoose } = await import("./db");
    const filter = mongoose.Types.ObjectId.isValid(id) && id.length === 24 ? { _id: new mongoose.Types.ObjectId(id), userId } : { _id: id, userId };
    await GalleryModel.deleteOne(filter);
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ id }).lean();
    return doc ? toUser(doc as any) : undefined;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ stripeCustomerId: customerId }).lean();
    return doc ? toUser(doc as any) : undefined;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }): Promise<User> {
    const doc = await UserModel.findOneAndUpdate(
      { id: userId },
      { $set: stripeInfo, updatedAt: new Date() },
      { new: true }
    ).lean();
    if (!doc) throw new Error("User not found");
    return toUser(doc as any);
  }
}

export const storage = new DatabaseStorage();
