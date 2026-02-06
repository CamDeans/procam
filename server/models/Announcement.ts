import mongoose from "mongoose";

export interface IAnnouncementDoc extends mongoose.Document {
  authorEmail: string;
  title: string;
  body: string;
  createdAt: Date;
}

const announcementSchema = new mongoose.Schema<IAnnouncementDoc>(
  {
    authorEmail: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

export const AnnouncementModel =
  mongoose.models?.Announcement ?? mongoose.model<IAnnouncementDoc>("Announcement", announcementSchema);
