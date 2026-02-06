/**
 * Vercel serverless entry. Forwards every request to the Express app.
 * Requires: npm run build (client → public/, server → dist/index.cjs) before deploy.
 */
import type { IncomingMessage, ServerResponse } from "http";

let appPromise: Promise<unknown> | null = null;

async function getApp(): Promise<(req: IncomingMessage, res: ServerResponse) => void> {
  if (!appPromise) {
    appPromise = import("../dist/index.cjs").then((m: { getApp: Promise<unknown> }) => m.getApp);
  }
  return (await appPromise) as (req: IncomingMessage, res: ServerResponse) => void;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const app = await getApp();
  app(req, res);
}
