import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Vercel serves public/ from CDN; express.static() is ignored. Only SPA fallback needed.
  if (process.env.VERCEL) {
    const publicDir = path.join(process.cwd(), "public");
    const indexPath = path.join(publicDir, "index.html");
    app.use("*", (_req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Not found");
      }
    });
    return;
  }

  const distPath = path.resolve(__dirname, "..", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
