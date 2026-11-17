// Pick the database driver at runtime:
// - Vercel Postgres / Neon (or any Postgres URL) in the cloud
// - built-in SQLite for local development
//
// Both adapters expose the same functions. The Postgres adapter is async,
// so every caller awaits the result; awaiting a plain SQLite value is fine.
//
// The adapter is imported lazily so the SQLite module (and its local data
// folder) is never loaded on Vercel when Postgres is configured.

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

export const database = connectionString
  ? "postgres"
  : process.env.VERCEL
    ? "unconfigured"
    : "sqlite";

let driverPromise;

function getDriver() {
  if (database === "unconfigured") {
    const error = new Error(
      "Database is not configured. Connect a Postgres database to the Vercel project and redeploy.",
    );
    error.status = 503;
    return Promise.reject(error);
  }

  if (!driverPromise) {
    driverPromise = connectionString
      ? import("./db-postgres.js")
      : import("./db-sqlite.js");
  }

  return driverPromise;
}

async function call(name, args) {
  const driver = await getDriver();
  return driver[name](...args);
}

export const listArtworks = (...args) => call("listArtworks", args);
export const getArtwork = (...args) => call("getArtwork", args);
export const getArtworkRow = (...args) => call("getArtworkRow", args);
export const createArtwork = (...args) => call("createArtwork", args);
export const updateArtwork = (...args) => call("updateArtwork", args);
export const deleteArtwork = (...args) => call("deleteArtwork", args);
export const listSales = (...args) => call("listSales", args);
export const getSale = (...args) => call("getSale", args);
export const createSale = (...args) => call("createSale", args);
export const updateSaleStatus = (...args) => call("updateSaleStatus", args);
export const deleteSale = (...args) => call("deleteSale", args);
export const syncArtworkStatus = (...args) => call("syncArtworkStatus", args);
export const createOrders = (...args) => call("createOrders", args);
export const createManualSale = (...args) => call("createManualSale", args);
export const getStats = (...args) => call("getStats", args);
