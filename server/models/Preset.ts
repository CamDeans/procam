import mongoose from "mongoose";

export interface IPresetDoc extends mongoose.Document {
  userId: string;
  name: string;
  settings: Record<string, unknown>;
  createdAt: Date;
}

const presetSchema = new mongoose.Schema<IPresetDoc>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    settings: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const PresetModel = mongoose.models?.Preset ?? mongoose.model<IPresetDoc>("Preset", presetSchema);
