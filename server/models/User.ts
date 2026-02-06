import mongoose from "mongoose";

export interface IUserDoc extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
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

const userSchema = new mongoose.Schema<IUserDoc>(
  {
    id: { type: String, required: true, unique: true },
    email: String,
    firstName: String,
    lastName: String,
    profileImageUrl: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
  { timestamps: true }
);

export const UserModel = mongoose.models?.User ?? mongoose.model<IUserDoc>("User", userSchema);
