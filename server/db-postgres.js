import { randomUUID } from "node:crypto";
import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error(
    "A Postgres connection string is required. Set DATABASE_URL (or POSTGRES_URL) in your environment.",
  );
}

const isLocalDatabase =
  /(^|@)(localhost|127\.0\.0\.1|::1)(:|\/|$)/.test(connectionString);

const pool = new Pool({
  connectionString,
  max: 3,
  ssl: isLocalDatabase ? undefined : { rejectUnauthorized: false },
});

const now = () => new Date().toISOString();

let schemaPromise;

function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = createSchema().catch((error) => {
      schemaPromise = undefined;
      throw error;
    });
  }

  return schemaPromise;
}

async function createSchema() {
  // Serverless functions can cold-start at the same time. The advisory lock
  // prevents concurrent CREATE TABLE statements from racing each other.
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(721304)");
    await client.query(`
        CREATE TABLE IF NOT EXISTS artworks (
          id          TEXT PRIMARY KEY,
          title       TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          price       DOUBLE PRECISION NOT NULL DEFAULT 0,
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
          amount         DOUBLE PRECISION NOT NULL DEFAULT 0,
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
    await client.query("COMMIT");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback failures and surface the original error.
    }
    throw error;
  } finally {
    client.release();
  }
}

// pg uses $1, $2 placeholders, while the SQLite adapter uses ?.
// Converting here keeps the queries in both adapters easy to compare.
function toPostgresSql(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${(index += 1)}`);
}

async function all(sql, params = []) {
  await ensureSchema();
  const result = await pool.query(toPostgresSql(sql), params);
  return result.rows;
}

async function one(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0] ?? null;
}

async function run(sql, params = []) {
  await ensureSchema();
  await pool.query(toPostgresSql(sql), params);
}

async function withTransaction(callback) {
  await ensureSchema();

  const client = await pool.connect();

  const query = {
    all: async (sql, params = []) =>
      (await client.query(toPostgresSql(sql), params)).rows,
    one: async (sql, params = []) => {
      const result = await client.query(toPostgresSql(sql), params);
      return result.rows[0] ?? null;
    },
    run: (sql, params = []) =>
      client.query(toPostgresSql(sql), params),
  };

  try {
    await client.query("BEGIN");
    const result = await callback(query);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback failures and surface the original error.
    }
    throw error;
  } finally {
    client.release();
  }
}

function mapArtwork(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    collection: row.collection,
    medium: row.medium,
    dimensions: row.dimensions,
    year: row.year === null ? null : Number(row.year),
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
    amount: Number(row.amount),
    status: row.status,
    saleDate: row.sale_date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listArtworks({ status } = {}) {
  const rows = status
    ? await all(
        "SELECT * FROM artworks WHERE status = ? ORDER BY created_at DESC",
        [status],
      )
    : await all("SELECT * FROM artworks ORDER BY created_at DESC");

  return rows.map(mapArtwork);
}

export async function getArtwork(id) {
  return mapArtwork(await one("SELECT * FROM artworks WHERE id = ?", [id]));
}

export async function getArtworkRow(id) {
  return one("SELECT * FROM artworks WHERE id = ?", [id]);
}

export async function createArtwork(data) {
  const id = randomUUID();
  const timestamp = now();

  await run(
    `INSERT INTO artworks (
      id, title, description, price, category, collection, medium,
      dimensions, year, status, image_url, image_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    ],
  );

  return getArtwork(id);
}

export async function updateArtwork(id, data) {
  const current = await getArtworkRow(id);
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

  await run(
    `UPDATE artworks SET
      title = ?, description = ?, price = ?, category = ?, collection = ?,
      medium = ?, dimensions = ?, year = ?, status = ?, image_url = ?,
      image_path = ?, updated_at = ?
    WHERE id = ?`,
    [
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
    ],
  );

  return getArtwork(id);
}

export async function deleteArtwork(id) {
  const current = await getArtworkRow(id);
  if (!current) return null;

  await withTransaction(async (query) => {
    // Keep the sales history, but detach it from the deleted artwork.
    await query.run("UPDATE sales SET artwork_id = NULL WHERE artwork_id = ?", [
      id,
    ]);
    await query.run("DELETE FROM artworks WHERE id = ?", [id]);
  });

  return current;
}

export async function listSales({ status } = {}) {
  const rows = status
    ? await all("SELECT * FROM sales WHERE status = ? ORDER BY created_at DESC", [
        status,
      ])
    : await all("SELECT * FROM sales ORDER BY created_at DESC");

  return rows.map(mapSale);
}

export async function getSale(id) {
  return mapSale(await one("SELECT * FROM sales WHERE id = ?", [id]));
}

async function insertSale(query, data) {
  const id = randomUUID();

  await query.run(
    `INSERT INTO sales (
      id, artwork_id, artwork_title, artwork_image, buyer_name, buyer_email,
      buyer_phone, amount, status, sale_date, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
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
    ],
  );

  return mapSale(await query.one("SELECT * FROM sales WHERE id = ?", [id]));
}

export async function createSale(data) {
  return insertSale({ run, one }, data);
}

export async function updateSaleStatus(id, status) {
  const sale = await getSale(id);
  if (!sale) return null;

  await run("UPDATE sales SET status = ? WHERE id = ?", [status, id]);

  if (sale.artworkId) await syncArtworkStatus(sale.artworkId);

  return getSale(id);
}

export async function deleteSale(id) {
  const sale = await getSale(id);
  if (!sale) return null;

  await run("DELETE FROM sales WHERE id = ?", [id]);

  if (sale.artworkId) await syncArtworkStatus(sale.artworkId);

  return sale;
}

export async function syncArtworkStatus(artworkId) {
  const artwork = await getArtworkRow(artworkId);
  if (!artwork) return;

  const rows = await all(
    "SELECT status FROM sales WHERE artwork_id = ?",
    [artworkId],
  );

  let status = "available";

  if (rows.some((row) => row.status === "paid")) {
    status = "sold";
  } else if (rows.some((row) => row.status === "pending")) {
    status = "reserved";
  }

  await run("UPDATE artworks SET status = ?, updated_at = ? WHERE id = ?", [
    status,
    now(),
    artworkId,
  ]);
}

export async function createOrders({ artworks, buyer, note }) {
  return withTransaction(async (query) => {
    const sales = [];

    for (const artwork of artworks) {
      sales.push(
        await insertSale(query, {
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
    }

    for (const artwork of artworks) {
      await query.run(
        "UPDATE artworks SET status = 'reserved', updated_at = ? WHERE id = ?",
        [now(), artwork.id],
      );
    }

    return sales;
  });
}

export async function createManualSale(data) {
  return withTransaction(async (query) => {
    const sale = await insertSale(query, { ...data, status: "paid" });

    await query.run(
      "UPDATE artworks SET status = 'sold', updated_at = ? WHERE id = ?",
      [now(), data.artworkId],
    );

    return sale;
  });
}

export async function getStats() {
  const artworkCounts = await all(
    "SELECT status, COUNT(*) AS count FROM artworks GROUP BY status",
  );

  const countFor = (status) =>
    Number(artworkCounts.find((row) => row.status === status)?.count ?? 0);

  const collections = Number(
    (
      await one(
        `SELECT COUNT(DISTINCT NULLIF(TRIM(collection), '')) AS count
         FROM artworks`,
      )
    ).count,
  );

  const revenue = Number(
    (
      await one(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM sales WHERE status = 'paid'",
      )
    ).total,
  );

  const pendingOrders = Number(
    (
      await one(
        "SELECT COUNT(*) AS count FROM sales WHERE status = 'pending'",
      )
    ).count,
  );

  const paidSales = Number(
    (
      await one(
        "SELECT COUNT(*) AS count FROM sales WHERE status = 'paid'",
      )
    ).count,
  );

  const month = new Date().toISOString().slice(0, 7);

  const monthRevenue = Number(
    (
      await one(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM sales
         WHERE status = 'paid' AND substr(sale_date, 1, 7) = ?`,
        [month],
      )
    ).total,
  );

  return {
    totalArtworks:
      countFor("available") + countFor("reserved") + countFor("sold"),
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

export default pool;
