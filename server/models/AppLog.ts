import mongoose from "mongoose";

export interface IAppLogDoc extends mongoose.Document {
  level: string;
  message: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const appLogSchema = new mongoose.Schema<IAppLogDoc>(
  {
    level: { type: String, required: true, index: true },
    message: { type: String, required: true },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

appLogSchema.index({ createdAt: -1 });

export const AppLogModel =
  mongoose.models?.AppLog ?? mongoose.model<IAppLogDoc>("AppLog", appLogSchema);
