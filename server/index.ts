import express, { type Request, Response, NextFunction, type Express } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { WebhookHandlers } from "./webhookHandlers";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "50mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined;

  const originalResJson = res.json.bind(res);
  (res as express.Response & { json: (body?: unknown) => express.Response }).json = function (bodyJson?: unknown) {
    capturedJsonResponse = bodyJson as Record<string, unknown> | undefined;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      log(logLine);
    }
  });

  next();
});

if (process.env.STRIPE_SECRET_KEY && !process.env.VERCEL) {
  const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? "5000"}`;
  log(`Stripe ready. Configure webhook: ${baseUrl.replace(/\/$/, "")}/api/stripe/webhook`, "stripe");
}

const resolveAppRef: { current: (app: Express) => void } = { current: () => {} };
/** Resolves when the app is ready (DB connected, routes registered). Used by Vercel serverless. */
export const getApp = new Promise<Express>((resolve) => {
  resolveAppRef.current = resolve;
});

(async () => {
  const { connectDb } = await import("./db");
  await connectDb();
  if (!process.env.VERCEL) log("MongoDB connected", "db");

  app.post("/api/stripe/webhook", async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) return res.status(400).json({ error: "Missing signature" });
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      await WebhookHandlers.processWebhook(req.rawBody as Buffer, sig);
      res.json({ received: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Webhook error";
      console.error(`Webhook Error: ${message}`);
      res.status(400).send(`Webhook Error: ${message}`);
    }
  });

  await registerRoutes(httpServer, app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status ?? (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  resolveAppRef.current(app);

  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      log(`serving on port ${port}`);
    });
  }
})();
