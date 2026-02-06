import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? process.env.DATABASE_URL;

if (!uri) {
  throw new Error(
    "MONGODB_URI or DATABASE_URL must be set. Use your MongoDB Atlas connection string."
  );
}

export async function connectDb(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  return mongoose.connect(uri!);
}

export { mongoose };
