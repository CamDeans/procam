import mongoose from "mongoose";

export interface IGalleryDoc extends mongoose.Document {
  userId: string;
  url: string;
  originalUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

const gallerySchema = new mongoose.Schema<IGalleryDoc>(
  {
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    originalUrl: String,
    thumbnailUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const GalleryModel = mongoose.models?.Gallery ?? mongoose.model<IGalleryDoc>("Gallery", gallerySchema);
