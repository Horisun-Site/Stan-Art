import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { put, del } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";

import {
  database,
  listArtworks,
  getArtwork,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  listSales,
  getSale,
  createManualSale,
  createOrders,
  updateSaleStatus,
  deleteSale,
  getStats,
} from "./db.js";

import {
  verifyCredentials,
  createToken,
  verifyToken,
  getAdminUser,
} from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "uploads");

/* ------------------------------------------------------------------ */
/* Storage mode                                                        */
/* ------------------------------------------------------------------ */

// Vercel Blob when configured. On Vercel without Blob we must not write
// images to the read-only (and ephemeral) function filesystem.
export const storageMode = process.env.BLOB_READ_WRITE_TOKEN
  ? "blob"
  : process.env.VERCEL
    ? "unconfigured"
    : "disk";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Vercel may hand the function an already-parsed JSON body. Only run the
// JSON parser when the body has not been parsed yet.
const jsonParser = express.json({ limit: "1mb" });

app.use((req, res, next) => {
  if (req.body !== undefined) {
    next();
    return;
  }

  jsonParser(req, res, next);
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

/* ------------------------------------------------------------------ */
/* Uploads                                                             */
/* ------------------------------------------------------------------ */

const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      const error = new Error("Only JPG, PNG or WEBP images are allowed.");
      error.status = 400;
      cb(error);
      return;
    }

    cb(null, true);
  },
});

if (storageMode === "disk") {
  app.use(
    "/uploads",
    express.static(uploadDir, {
      maxAge: "30d",
      fallthrough: true,
    }),
  );
}

function imageExtension(file) {
  return (
    allowedImageTypes.get(file.mimetype) ||
    path.extname(file.originalname).toLowerCase() ||
    ".jpg"
  );
}

async function storeUpload(file) {
  if (storageMode === "blob") {
    const blob = await put(
      `artworks/${Date.now()}-${randomUUID()}${imageExtension(file)}`,
      file.buffer,
      {
        access: "public",
        contentType: file.mimetype,
        addRandomSuffix: true,
      },
    );

    return { url: blob.url, path: blob.url };
  }

  if (storageMode !== "disk") {
    fail(
      503,
      "Image storage is not configured. Add a Vercel Blob store and redeploy.",
    );
  }

  fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}${imageExtension(file)}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  return { url: `/uploads/${filename}`, path: filePath };
}

function isBlobUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

function blobImageUrl(value) {
  if (!value) fail(400, "Please select an artwork image.");

  const clean = text(value, "Image URL", { required: true, max: 2000 });

  if (!isBlobUrl(clean)) {
    fail(400, "Please upload the artwork image again.");
  }

  return clean;
}

async function removeImage({ imageUrl, imagePath } = {}) {
  const blobUrl = [imageUrl, imagePath].find(isBlobUrl);

  if (blobUrl) {
    try {
      await del(blobUrl);
    } catch (error) {
      console.error("[blob] Could not delete image:", error);
    }
    return;
  }

  const localPath = [imagePath, imageUrl].find(
    (value) => typeof value === "string" && value.startsWith(uploadDir),
  );

  if (localPath) {
    fs.unlink(localPath, () => {});
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const CATEGORIES = new Set([
  "abstract",
  "portrait",
  "landscape",
  "contemporary",
  "other",
]);

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

function text(value, field, { required = false, max = 500 } = {}) {
  if (value === undefined || value === null) {
    if (required) fail(400, `${field} is required.`);
    return "";
  }

  const clean = String(value).trim();

  if (required && !clean) fail(400, `${field} is required.`);
  if (clean.length > max) {
    fail(400, `${field} must be ${max} characters or fewer.`);
  }

  return clean;
}

function money(value, field = "Price") {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    fail(400, `${field} must be greater than zero.`);
  }

  return Math.round(amount * 100) / 100;
}

function yearValue(value) {
  if (value === undefined || value === null || value === "") return null;

  const year = Number(value);

  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    fail(400, "Year must be between 1900 and 2100.");
  }

  return year;
}

function artworkStatus(value, fallback = "available") {
  if (value === undefined || value === null || value === "") return fallback;
  if (!["available", "reserved", "sold"].includes(value)) {
    fail(400, "Invalid artwork status.");
  }
  return value;
}

function saleStatus(value) {
  if (!["pending", "paid", "cancelled"].includes(value)) {
    fail(400, "Invalid sale status.");
  }
  return value;
}

function saleDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    fail(400, "Sale date must use the YYYY-MM-DD format.");
  }

  return value;
}

function publicUser() {
  return getAdminUser();
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

const loginAttempts = new Map();
const loginWindowMs = 15 * 60 * 1000;
const loginMax = 20;

function loginKey(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function pruneLoginAttempts(now) {
  for (const [key, entry] of loginAttempts) {
    if (now - entry.start > loginWindowMs) {
      loginAttempts.delete(key);
    }
  }
}

function loginLimiter(req, res, next) {
  const now = Date.now();
  pruneLoginAttempts(now);

  const entry = loginAttempts.get(loginKey(req));

  if (entry && entry.count >= loginMax) {
    const remainingMs = entry.start + loginWindowMs - now;
    const minutes = Math.max(1, Math.ceil(remainingMs / 60000));

    res.status(429).json({
      error: `Too many sign-in attempts. Please try again in ${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      }.`,
    });
    return;
  }

  next();
}

function recordFailedLogin(req) {
  const now = Date.now();
  const key = loginKey(req);
  const entry = loginAttempts.get(key);

  if (!entry || now - entry.start > loginWindowMs) {
    loginAttempts.set(key, { start: now, count: 1 });
    return;
  }

  entry.count += 1;
}

function clearLoginAttempts(req) {
  loginAttempts.delete(loginKey(req));
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const user = verifyToken(token);

  if (!user) {
    res.status(401).json({
      error: "Your session has expired. Please sign in again.",
    });
    return;
  }

  req.user = user;
  next();
}

app.use("/api/auth", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.post("/api/auth/login", loginLimiter, (req, res) => {
  const { email, password } = req.body || {};

  if (!verifyCredentials(email, password)) {
    recordFailedLogin(req);
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  clearLoginAttempts(req);

  res.json({
    token: createToken(),
    user: publicUser(),
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

/* ------------------------------------------------------------------ */
/* Client uploads (Vercel Blob)                                        */
/* ------------------------------------------------------------------ */

app.post("/api/uploads", requireAuth, async (req, res, next) => {
  try {
    if (storageMode !== "blob") {
      fail(
        503,
        "Image storage is not configured. Add a Vercel Blob store and redeploy.",
      );
    }

    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^artworks\/[A-Za-z0-9._-]+$/.test(pathname)) {
          fail(400, "Invalid image upload path.");
        }

        return {
          allowedContentTypes: [...allowedImageTypes.keys()],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Artworks                                                            */
/* ------------------------------------------------------------------ */

app.get("/api/artworks", async (req, res, next) => {
  try {
    const status = req.query.status;

    if (status && !["available", "reserved", "sold"].includes(status)) {
      res.status(400).json({ error: "Invalid artwork status filter." });
      return;
    }

    res.json({ artworks: await listArtworks({ status }) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/artworks/:id", async (req, res, next) => {
  try {
    const artwork = await getArtwork(req.params.id);

    if (!artwork) {
      res.status(404).json({ error: "Artwork not found." });
      return;
    }

    res.json({ artwork });
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/artworks",
  requireAuth,
  upload.single("image"),
  async (req, res, next) => {
    let storedImage = null;

    try {
      const body = req.body || {};
      let imageUrl;
      let imagePath;

      if (req.file) {
        storedImage = await storeUpload(req.file);
        imageUrl = storedImage.url;
        imagePath = storedImage.path;
      } else {
        imageUrl = blobImageUrl(body.imageUrl);
        imagePath = imageUrl;
      }

      const title = text(body.title, "Title", {
        required: true,
        max: 200,
      });
      const description = text(body.description, "Description", {
        required: true,
        max: 5000,
      });
      const price = money(body.price);
      const category = text(body.category, "Category", {
        required: true,
        max: 50,
      });

      if (!CATEGORIES.has(category)) {
        fail(400, "Please choose a valid category.");
      }

      const artwork = await createArtwork({
        title,
        description,
        price,
        category,
        collection: text(body.collectionName, "Collection", {
          max: 200,
        }),
        medium: text(body.medium, "Medium", { max: 200 }),
        dimensions: text(body.dimensions, "Dimensions", {
          max: 200,
        }),
        year: yearValue(body.year),
        status:
          artworkStatus(body.status, "available") === "sold"
            ? "sold"
            : "available",
        imageUrl,
        imagePath,
      });

      res.status(201).json({ artwork });
    } catch (error) {
      if (storedImage) {
        await removeImage({
          imageUrl: storedImage.url,
          imagePath: storedImage.path,
        });
      }
      next(error);
    }
  },
);

app.patch("/api/artworks/:id", requireAuth, async (req, res, next) => {
  try {
    const current = await getArtwork(req.params.id);

    if (!current) fail(404, "Artwork not found.");

    const body = req.body || {};
    const data = {};

    if (body.title !== undefined) {
      data.title = text(body.title, "Title", { required: true, max: 200 });
    }

    if (body.description !== undefined) {
      data.description = text(body.description, "Description", {
        required: true,
        max: 5000,
      });
    }

    if (body.price !== undefined) {
      data.price = money(body.price);
    }

    if (body.category !== undefined) {
      const category = text(body.category, "Category", {
        required: true,
        max: 50,
      });
      if (!CATEGORIES.has(category)) {
        fail(400, "Please choose a valid category.");
      }
      data.category = category;
    }

    if (body.collection !== undefined) {
      data.collection = text(body.collection, "Collection", { max: 200 });
    }

    if (body.medium !== undefined) {
      data.medium = text(body.medium, "Medium", { max: 200 });
    }

    if (body.dimensions !== undefined) {
      data.dimensions = text(body.dimensions, "Dimensions", { max: 200 });
    }

    if (body.year !== undefined) {
      data.year = yearValue(body.year);
    }

    if (body.status !== undefined) {
      data.status = artworkStatus(body.status);
    }

    const artwork = await updateArtwork(req.params.id, data);
    res.json({ artwork });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/artworks/:id", requireAuth, async (req, res, next) => {
  try {
    const artwork = await deleteArtwork(req.params.id);

    if (!artwork) fail(404, "Artwork not found.");

    await removeImage({
      imageUrl: artwork.image_url,
      imagePath: artwork.image_path,
    });

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Sales                                                              */
/* ------------------------------------------------------------------ */

app.get("/api/sales", requireAuth, async (req, res, next) => {
  try {
    const status = req.query.status;

    if (status && !["pending", "paid", "cancelled"].includes(status)) {
      res.status(400).json({ error: "Invalid sale status filter." });
      return;
    }

    res.json({ sales: await listSales({ status }) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/sales", requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const artwork = await getArtwork(body.artworkId);

    if (!artwork) fail(404, "Artwork not found.");
    if (artwork.status === "sold") {
      fail(409, "This artwork is already marked as sold.");
    }

    const amount =
      body.amount === undefined || body.amount === ""
        ? artwork.price
        : money(body.amount, "Sale amount");

    const sale = await createManualSale({
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      artworkImage: artwork.imageUrl,
      buyerName: text(body.buyerName, "Buyer name", {
        required: true,
        max: 200,
      }),
      buyerEmail: text(body.buyerEmail, "Buyer email", { max: 200 }),
      buyerPhone: text(body.buyerPhone, "Buyer phone", { max: 50 }),
      amount,
      saleDate: saleDate(body.saleDate),
      notes: text(body.notes, "Notes", { max: 2000 }),
    });

    res.status(201).json({ sale });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/sales/:id", requireAuth, async (req, res, next) => {
  try {
    const sale = await getSale(req.params.id);

    if (!sale) fail(404, "Sale not found.");

    const updated = await updateSaleStatus(
      req.params.id,
      saleStatus(req.body?.status),
    );

    res.json({ sale: updated });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/sales/:id", requireAuth, async (req, res, next) => {
  try {
    const sale = await deleteSale(req.params.id);

    if (!sale) fail(404, "Sale not found.");

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Public purchase requests                                            */
/* ------------------------------------------------------------------ */

const orderAttempts = new Map();
const orderWindowMs = 10 * 60 * 1000;
const orderMax = 10;

function orderLimiter(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = orderAttempts.get(key);

  if (!entry || now - entry.start > orderWindowMs) {
    orderAttempts.set(key, { start: now, count: 1 });
    next();
    return;
  }

  entry.count += 1;

  if (entry.count > orderMax) {
    res.status(429).json({
      error: "Too many purchase requests. Please try again later.",
    });
    return;
  }

  next();
}

app.post("/api/orders", orderLimiter, async (req, res, next) => {
  try {
    const body = req.body || {};
    const customer = body.customer || {};

    const name = text(customer.name, "Full name", {
      required: true,
      max: 200,
    });
    const email = text(customer.email, "Email", {
      required: true,
      max: 200,
    });
    const phone = text(customer.phone, "Phone number", { max: 50 });
    const note = text(body.note, "Note", { max: 2000 });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail(400, "Please enter a valid email address.");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      fail(400, "Your cart is empty.");
    }

    const ids = [...new Set(body.items.map(String))];

    if (ids.length > 10) {
      fail(400, "You can request a maximum of 10 artworks at once.");
    }

    const artworks = [];

    for (const id of ids) {
      const artwork = await getArtwork(id);
      if (!artwork) fail(404, "One of the selected artworks no longer exists.");
      if (artwork.status !== "available") {
        fail(
          409,
          `"${artwork.title}" is no longer available. Please remove it from your cart.`,
        );
      }
      artworks.push(artwork);
    }

    const sales = await createOrders({
      artworks,
      buyer: { name, email, phone },
      note,
    });

    const total = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const reference = sales[0].id.slice(0, 8).toUpperCase();

    res.status(201).json({
      reference,
      count: sales.length,
      total,
      message:
        "Your request has been received. The studio will contact you to arrange payment and delivery.",
    });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Stats + health                                                      */
/* ------------------------------------------------------------------ */

app.get("/api/stats", requireAuth, async (_req, res, next) => {
  try {
    res.json({ stats: await getStats() });
  } catch (error) {
    next(error);
  }
});

app.get("/api/config", (_req, res) => {
  res.json({ storage: storageMode });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database,
    storage: storageMode,
    time: new Date().toISOString(),
  });
});

export default app;
