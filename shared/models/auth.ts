// User types (DB-agnostic; MongoDB stores these fields)
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}
