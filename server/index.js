import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import {
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
  getAdminEmail,
} from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const uploadDir = path.join(__dirname, "uploads");
const distDir = path.join(rootDir, "dist");

fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
const port = Number(process.env.PORT) || 5174;

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.set("trust proxy", 1);

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
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const extension =
        allowedImageTypes.get(file.mimetype) ||
        path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${extension}`);
    },
  }),
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

app.use(
  "/uploads",
  express.static(uploadDir, {
    maxAge: "30d",
    fallthrough: true,
  }),
);

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

  if (
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100
  ) {
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

function removeFile(file) {
  if (!file?.path) return;

  fs.unlink(file.path, () => {});
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
/* Artworks                                                            */
/* ------------------------------------------------------------------ */

app.get("/api/artworks", (req, res) => {
  const status = req.query.status;

  if (status && !["available", "reserved", "sold"].includes(status)) {
    res.status(400).json({ error: "Invalid artwork status filter." });
    return;
  }

  res.json({ artworks: listArtworks({ status }) });
});

app.get("/api/artworks/:id", (req, res) => {
  const artwork = getArtwork(req.params.id);

  if (!artwork) {
    res.status(404).json({ error: "Artwork not found." });
    return;
  }

  res.json({ artwork });
});

app.post(
  "/api/artworks",
  requireAuth,
  upload.single("image"),
  (req, res, next) => {
    try {
      if (!req.file) fail(400, "Please select an artwork image.");

      const title = text(req.body.title, "Title", {
        required: true,
        max: 200,
      });
      const description = text(req.body.description, "Description", {
        required: true,
        max: 5000,
      });
      const price = money(req.body.price);
      const category = text(req.body.category, "Category", {
        required: true,
        max: 50,
      });

      if (!CATEGORIES.has(category)) {
        fail(400, "Please choose a valid category.");
      }

      const artwork = createArtwork({
        title,
        description,
        price,
        category,
        collection: text(req.body.collectionName, "Collection", {
          max: 200,
        }),
        medium: text(req.body.medium, "Medium", { max: 200 }),
        dimensions: text(req.body.dimensions, "Dimensions", {
          max: 200,
        }),
        year: yearValue(req.body.year),
        status:
          artworkStatus(req.body.status, "available") === "sold"
            ? "sold"
            : "available",
        imageUrl: `/uploads/${req.file.filename}`,
        imagePath: req.file.path,
      });

      res.status(201).json({ artwork });
    } catch (error) {
      removeFile(req.file);
      next(error);
    }
  },
);

app.patch("/api/artworks/:id", requireAuth, (req, res, next) => {
  try {
    const current = getArtwork(req.params.id);

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

    const artwork = updateArtwork(req.params.id, data);
    res.json({ artwork });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/artworks/:id", requireAuth, (req, res, next) => {
  try {
    const artwork = deleteArtwork(req.params.id);

    if (!artwork) fail(404, "Artwork not found.");

    if (artwork.image_path && artwork.image_path.startsWith(uploadDir)) {
      fs.unlink(artwork.image_path, () => {});
    }

    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

/* ------------------------------------------------------------------ */
/* Sales                                                              */
/* ------------------------------------------------------------------ */

app.get("/api/sales", requireAuth, (req, res) => {
  const status = req.query.status;

  if (status && !["pending", "paid", "cancelled"].includes(status)) {
    res.status(400).json({ error: "Invalid sale status filter." });
    return;
  }

  res.json({ sales: listSales({ status }) });
});

app.post("/api/sales", requireAuth, (req, res, next) => {
  try {
    const body = req.body || {};
    const artwork = getArtwork(body.artworkId);

    if (!artwork) fail(404, "Artwork not found.");
    if (artwork.status === "sold") {
      fail(409, "This artwork is already marked as sold.");
    }

    const amount =
      body.amount === undefined || body.amount === ""
        ? artwork.price
        : money(body.amount, "Sale amount");

    const sale = createManualSale({
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

app.patch("/api/sales/:id", requireAuth, (req, res, next) => {
  try {
    const sale = getSale(req.params.id);

    if (!sale) fail(404, "Sale not found.");

    const updated = updateSaleStatus(
      req.params.id,
      saleStatus(req.body?.status),
    );

    res.json({ sale: updated });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/sales/:id", requireAuth, (req, res, next) => {
  try {
    const sale = deleteSale(req.params.id);

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

app.post("/api/orders", orderLimiter, (req, res, next) => {
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

    const artworks = ids.map((id) => {
      const artwork = getArtwork(id);
      if (!artwork) fail(404, "One of the selected artworks no longer exists.");
      if (artwork.status !== "available") {
        fail(
          409,
          `"${artwork.title}" is no longer available. Please remove it from your cart.`,
        );
      }
      return artwork;
    });

    const sales = createOrders({
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
/* Stats                                                               */
/* ------------------------------------------------------------------ */

app.get("/api/stats", requireAuth, (_req, res) => {
  res.json({ stats: getStats() });
});

/* ------------------------------------------------------------------ */
/* Health + static frontend                                            */
/* ------------------------------------------------------------------ */

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: "sqlite",
    time: new Date().toISOString(),
  });
});

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

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image is too large. Please use an image under 10MB."
        : "The image could not be uploaded.";
    res.status(400).json({ error: message });
    return;
  }

  const status = error.status || 500;

  if (status >= 500) {
    console.error("[server]", error);
  }

  res.status(status).json({
    error:
      error.status && error.message
        ? error.message
        : "Something went wrong. Please try again.",
  });
});

app.listen(port, () => {
  console.log(`Stan Art server running at http://localhost:${port}`);
  console.log(`Admin email: ${getAdminEmail()}`);
  console.log(`Database: server/data/stan-art.db`);
});
