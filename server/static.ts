import express, { type Express } from "express";
import path from "path";
import fs from "fs";
import { log } from "./vite";

export function serveStaticFiles(app: Express) {
  // Match the build output from vite.config.ts: dist/public
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    log(`Build directory not found at: ${distPath}`);
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first with 'npm run build'`,
    );
  }

  log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      log(`index.html not found at: ${indexPath}`);
      res.status(500).json({ error: "Application build incomplete" });
      return;
    }
    res.sendFile(indexPath);
  });
}