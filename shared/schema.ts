import { z } from "zod";
export * from "./models/auth";

// Types for presets and gallery (DB-agnostic)
export interface Preset {
  id: string;
  userId: string;
  name: string;
  settings: Record<string, unknown>;
  createdAt: Date;
}

export interface GalleryItem {
  id: string;
  userId: string;
  url: string;
  originalUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

// API input (server adds userId from auth)
export const insertPresetSchema = z.object({
  name: z.string(),
  settings: z.record(z.unknown()),
});
export const insertGallerySchema = z.object({
  url: z.string(),
  originalUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type InsertGalleryItem = z.infer<typeof insertGallerySchema>;
