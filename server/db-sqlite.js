import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "stan-art.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbFile);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS artworks (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price       REAL NOT NULL DEFAULT 0,
    category    TEXT NOT NULL DEFAULT 'other',
    collection  TEXT NOT NULL DEFAULT '',
    medium      TEXT NOT NULL DEFAULT '',
    dimensions  TEXT NOT NULL DEFAULT '',
    year        INTEGER,
    status      TEXT NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'reserved', 'sold')),
    image_url   TEXT NOT NULL,
    image_path  TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sales (
    id             TEXT PRIMARY KEY,
    artwork_id     TEXT,
    artwork_title  TEXT NOT NULL,
    artwork_image  TEXT NOT NULL DEFAULT '',
    buyer_name     TEXT NOT NULL DEFAULT '',
    buyer_email    TEXT NOT NULL DEFAULT '',
    buyer_phone    TEXT NOT NULL DEFAULT '',
    amount         REAL NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'paid'
                   CHECK (status IN ('pending', 'paid', 'cancelled')),
    sale_date      TEXT NOT NULL,
    notes          TEXT NOT NULL DEFAULT '',
    created_at     TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
  CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
  CREATE INDEX IF NOT EXISTS idx_sales_artwork ON sales(artwork_id);
`);

const now = () => new Date().toISOString();

function mapArtwork(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category,
    collection: row.collection,
    medium: row.medium,
    dimensions: row.dimensions,
    year: row.year,
    status: row.status,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSale(row) {
  if (!row) return null;

  return {
    id: row.id,
    artworkId: row.artwork_id,
    artworkTitle: row.artwork_title,
    artworkImage: row.artwork_image,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email,
    buyerPhone: row.buyer_phone,
    amount: row.amount,
    status: row.status,
    saleDate: row.sale_date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function listArtworks({ status } = {}) {
  const rows = status
    ? db
        .prepare(
          "SELECT * FROM artworks WHERE status = ? ORDER BY created_at DESC",
        )
        .all(status)
    : db.prepare("SELECT * FROM artworks ORDER BY created_at DESC").all();

  return rows.map(mapArtwork);
}

export function getArtwork(id) {
  return mapArtwork(
    db.prepare("SELECT * FROM artworks WHERE id = ?").get(id),
  );
}

export function getArtworkRow(id) {
  return db.prepare("SELECT * FROM artworks WHERE id = ?").get(id);
}

export function createArtwork(data) {
  const id = randomUUID();
  const timestamp = now();

  db.prepare(
    `INSERT INTO artworks (
      id, title, description, price, category, collection, medium,
      dimensions, year, status, image_url, image_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.title,
    data.description,
    data.price,
    data.category,
    data.collection,
    data.medium,
    data.dimensions,
    data.year,
    data.status,
    data.imageUrl,
    data.imagePath,
    timestamp,
    timestamp,
  );

  return getArtwork(id);
}

export function updateArtwork(id, data) {
  const current = getArtworkRow(id);
  if (!current) return null;

  const next = {
    title: data.title ?? current.title,
    description: data.description ?? current.description,
    price: data.price ?? current.price,
    category: data.category ?? current.category,
    collection: data.collection ?? current.collection,
    medium: data.medium ?? current.medium,
    dimensions: data.dimensions ?? current.dimensions,
    year: data.year !== undefined ? data.year : current.year,
    status: data.status ?? current.status,
    image_url: data.imageUrl ?? current.image_url,
    image_path: data.imagePath ?? current.image_path,
  };

  db.prepare(
    `UPDATE artworks SET
      title = ?, description = ?, price = ?, category = ?, collection = ?,
      medium = ?, dimensions = ?, year = ?, status = ?, image_url = ?,
      image_path = ?, updated_at = ?
    WHERE id = ?`,
  ).run(
    next.title,
    next.description,
    next.price,
    next.category,
    next.collection,
    next.medium,
    next.dimensions,
    next.year,
    next.status,
    next.image_url,
    next.image_path,
    now(),
    id,
  );

  return getArtwork(id);
}

export function deleteArtwork(id) {
  const current = getArtworkRow(id);
  if (!current) return null;

  db.exec("BEGIN");
  try {
    // Keep the sales history, but detach it from the deleted artwork.
    db.prepare("UPDATE sales SET artwork_id = NULL WHERE artwork_id = ?").run(id);
    db.prepare("DELETE FROM artworks WHERE id = ?").run(id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return current;
}

export function listSales({ status } = {}) {
  const rows = status
    ? db
        .prepare(
          "SELECT * FROM sales WHERE status = ? ORDER BY created_at DESC",
        )
        .all(status)
    : db.prepare("SELECT * FROM sales ORDER BY created_at DESC").all();

  return rows.map(mapSale);
}

export function getSale(id) {
  return mapSale(db.prepare("SELECT * FROM sales WHERE id = ?").get(id));
}

export function createSale(data) {
  const id = randomUUID();

  db.prepare(
    `INSERT INTO sales (
      id, artwork_id, artwork_title, artwork_image, buyer_name, buyer_email,
      buyer_phone, amount, status, sale_date, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    data.artworkId ?? null,
    data.artworkTitle,
    data.artworkImage ?? "",
    data.buyerName ?? "",
    data.buyerEmail ?? "",
    data.buyerPhone ?? "",
    data.amount,
    data.status ?? "paid",
    data.saleDate,
    data.notes ?? "",
    now(),
  );

  return getSale(id);
}

export function updateSaleStatus(id, status) {
  const sale = getSale(id);
  if (!sale) return null;

  db.prepare("UPDATE sales SET status = ? WHERE id = ?").run(status, id);

  if (sale.artworkId) syncArtworkStatus(sale.artworkId);

  return getSale(id);
}

export function deleteSale(id) {
  const sale = getSale(id);
  if (!sale) return null;

  db.prepare("DELETE FROM sales WHERE id = ?").run(id);

  if (sale.artworkId) syncArtworkStatus(sale.artworkId);

  return sale;
}

export function syncArtworkStatus(artworkId) {
  const artwork = getArtworkRow(artworkId);
  if (!artwork) return;

  const rows = db
    .prepare("SELECT status FROM sales WHERE artwork_id = ?")
    .all(artworkId);

  let status = "available";

  if (rows.some((row) => row.status === "paid")) {
    status = "sold";
  } else if (rows.some((row) => row.status === "pending")) {
    status = "reserved";
  }

  db.prepare(
    "UPDATE artworks SET status = ?, updated_at = ? WHERE id = ?",
  ).run(status, now(), artworkId);
}

export function createOrders({ artworks, buyer, note }) {
  db.exec("BEGIN");
  try {
    const sales = artworks.map((artwork) =>
      createSale({
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        artworkImage: artwork.imageUrl,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        amount: artwork.price,
        status: "pending",
        saleDate: new Date().toISOString().slice(0, 10),
        notes: note,
      }),
    );

    const reserve = db.prepare(
      "UPDATE artworks SET status = 'reserved', updated_at = ? WHERE id = ?",
    );

    for (const artwork of artworks) {
      reserve.run(now(), artwork.id);
    }

    db.exec("COMMIT");
    return sales;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function createManualSale(data) {
  db.exec("BEGIN");
  try {
    const sale = createSale({ ...data, status: "paid" });

    db.prepare(
      "UPDATE artworks SET status = 'sold', updated_at = ? WHERE id = ?",
    ).run(now(), data.artworkId);

    db.exec("COMMIT");
    return sale;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getStats() {
  const artworkCounts = db
    .prepare("SELECT status, COUNT(*) AS count FROM artworks GROUP BY status")
    .all();

  const countFor = (status) =>
    artworkCounts.find((row) => row.status === status)?.count ?? 0;

  const collections = db
    .prepare(
      `SELECT COUNT(DISTINCT NULLIF(TRIM(collection), '')) AS count
       FROM artworks`,
    )
    .get().count;

  const revenue = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM sales WHERE status = 'paid'",
    )
    .get().total;

  const pendingOrders = db
    .prepare("SELECT COUNT(*) AS count FROM sales WHERE status = 'pending'")
    .get().count;

  const paidSales = db
    .prepare("SELECT COUNT(*) AS count FROM sales WHERE status = 'paid'")
    .get().count;

  const month = new Date().toISOString().slice(0, 7);
  const monthRevenue = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM sales
       WHERE status = 'paid' AND substr(sale_date, 1, 7) = ?`,
    )
    .get(month).total;

  return {
    totalArtworks: countFor("available") + countFor("reserved") + countFor("sold"),
    available: countFor("available"),
    reserved: countFor("reserved"),
    sold: countFor("sold"),
    collections,
    totalRevenue: revenue,
    monthRevenue,
    pendingOrders,
    paidSales,
  };
}

export default db;
