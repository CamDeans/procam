import type { User, UpsertUser } from "@shared/models/auth";
import { UserModel } from "../models";

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

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ id }).lean();
    return doc ? toUser(doc as any) : undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const doc = await UserModel.findOneAndUpdate(
      { id: userData.id },
      {
        $set: {
          ...userData,
          updatedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    ).lean();
    return toUser(doc as any);
  }
}

export const authStorage = new AuthStorage();
