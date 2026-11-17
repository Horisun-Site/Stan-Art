import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import app from "./app.js";
import { getAdminEmail } from "./auth.js";
import { database } from "./db.js";
import { errorHandler, notFound } from "./http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const port = Number(process.env.PORT) || 5174;

// Serve the built frontend when `npm start` is used. In development Vite
// serves the frontend and proxies API requests to this server instead.
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { index: false }));

  app.use((req, res, next) => {
    if (
      req.method !== "GET" ||
      req.path.startsWith("/api") ||
      req.path.startsWith("/uploads")
    ) {
      next();
      return;
    }

    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Stan Art server running at http://localhost:${port}`);
  console.log(`Admin email: ${getAdminEmail()}`);
  console.log(`Database: ${database}`);
});
