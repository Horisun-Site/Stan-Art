# Stan Art Studio

A contemporary art portfolio and studio shop built with React, Vite and Tailwind CSS. The API is a small Express app that can run two ways:

- **Locally:** Node + SQLite + images in `server/uploads/`.
- **On Vercel:** a serverless function + Postgres (Neon/Vercel Postgres) + Vercel Blob.

The frontend and API are in the same project. There is no Firebase dependency.

## Features

- **Admin login.** Email + password sign-in is verified by the server, with a signed session token.
- **Artwork management.** Add, edit and delete artworks, with images, dimensions, medium, collection, year and price.
- **Working shop and cart.** Artworks appear on the home page and shop; visitors can submit purchase requests.
- **Sales dashboard.** Requests arrive as **pending sales**, and can be marked paid or cancelled. Offline sales can also be recorded.
- **Stats.** Artwork counts, revenue, monthly revenue and pending-request count.
- **Portable storage.** SQLite or Postgres for data; local disk or Vercel Blob for images.

## Requirements

- Node.js **22.13 or newer** (the local database uses Node's built-in `node:sqlite` module).
- npm.

## Quick start (local)

```bash
npm install
npm run dev
```

- Site: http://localhost:5173
- Admin login: http://localhost:5173/login
- Admin dashboard: http://localhost:5173/admin
- API server: http://localhost:5174

`npm run dev` starts the Vite frontend and the Node server together. Vite proxies `/api` and `/uploads` to the server.

With no cloud variables set, the app automatically uses:

| Setting | Local default |
| --- | --- |
| Database | `server/data/stan-art.db` (SQLite) |
| Images | `server/uploads/` (served at `/uploads/...`) |

## Admin login

Your login details are stored in `.env.local`:

```env
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD="use-a-long-unique-password"
AUTH_SECRET="use-a-long-random-string"
PORT=5174
```

The values in your `.env.local` are the credentials to use. They are not stored in the database, so **if you forget them, open `.env.local`, change them, and restart the server** — no password-reset email is needed.

After signing in you are taken to the dashboard at `/admin`. If you opened a protected page first, you are returned to that page after signing in. `/admin/login` redirects to `/login`, and the old `/main` dashboard URL redirects to `/admin`.

To change your login:

1. Edit `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `AUTH_SECRET` in `.env.local`.
2. Use a long random value for `AUTH_SECRET`.
3. Restart the server (`Ctrl+C`, then `npm run dev` again).

> `.env.local` is ignored by Git. Never commit it or share it publicly. If you deploy the site, set these values in your host's environment settings instead.

## Deploy to Vercel

The site is set up for Vercel's serverless platform. Vercel cannot keep SQLite or local image files, so production uses hosted Postgres and Vercel Blob.

### 1. Create the Vercel project

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Vite. Keep the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy once. The frontend will load, but the API needs the steps below.

### 2. Add Postgres

1. Open the project in Vercel.
2. Go to **Storage → Create Database → Neon** (or **Vercel Postgres**).
3. Create a free database and **connect it to this project** for Production, Preview and Development.
4. Vercel adds `DATABASE_URL` (or `POSTGRES_URL`) automatically. The API detects it and switches from SQLite to Postgres.

### 3. Add Vercel Blob

1. Go to **Storage → Create → Blob**.
2. Create a **public** store and **connect it to this project**. Artwork images are public by design.
3. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically. The browser then uploads images directly to Blob, avoiding the serverless request-size limit.

### 4. Add the auth variables

In **Settings → Environment Variables**, add these for Production, Preview and Development:

| Variable | Example | Required |
| --- | --- | --- |
| `ADMIN_EMAIL` | `you@example.com` | Yes |
| `ADMIN_PASSWORD` | a long unique password | Yes |
| `AUTH_SECRET` | a long random string | Yes |
| `DATABASE_URL` | added by the Neon integration | Yes on Vercel |
| `BLOB_READ_WRITE_TOKEN` | added by the Blob integration | Yes on Vercel |

Use the same admin values as your local `.env.local`. Changing `AUTH_SECRET` signs out existing sessions.

### 5. Redeploy

Environment variables and the `api/` function are only picked up by a new deployment. Open **Deployments → … → Redeploy** after adding the storage integrations and variables.

### 6. Verify

- `https://your-project.vercel.app/api/health` should return JSON like:
  ```json
  { "ok": true, "database": "postgres", "storage": "blob", "time": "..." }
  ```
- `https://your-project.vercel.app/api/config` should return `{ "storage": "blob" }`.
- Sign in at `/login` and add an artwork.

If `/api/health` returns HTML or login returns **405**, the `api/[...path].js` function was not included in the deployment. Check the **Functions** tab in Vercel, confirm the latest commit was deployed, and redeploy.

The new Postgres database starts empty. Re-add artworks in the dashboard, or import the contents of `server/data/stan-art.db` if you have local data worth keeping.

## Production (self-hosted Node)

The original long-lived Node setup still works, including SQLite and local uploads:

```bash
npm run build
npm start
```

The server serves the built frontend from `dist/` at http://localhost:5174 and serves uploaded images from `/uploads`. Use a host with a persistent disk for this mode. If you set `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`, the same server uses Postgres and Blob instead.

## How storage is selected

The server picks storage automatically at startup:

| Environment | Database | Images |
| --- | --- | --- |
| No `DATABASE_URL` / `POSTGRES_URL` / `POSTGRES_PRISMA_URL` (local) | SQLite in `server/data/` | Local `server/uploads/` |
| Postgres URL present | Postgres | Local disk, unless Blob is configured |
| `BLOB_READ_WRITE_TOKEN` present | SQLite or Postgres | Vercel Blob |
| On Vercel without a database URL | **Unconfigured** — API returns a clear 503 | Local disk is also disabled |
| On Vercel without `BLOB_READ_WRITE_TOKEN` | Postgres | **Unconfigured** — uploads are blocked with a clear error |

`GET /api/config` reports the active image mode (`blob`, `disk` or `unconfigured`) so the add-artwork form knows whether to upload directly to Blob.

## Data and backups

### Local / self-hosted

| Path | Contents |
| --- | --- |
| `server/data/stan-art.db` | SQLite database (artworks, sales, prices, buyers) |
| `server/uploads/` | Uploaded artwork images |

Stop the server and copy both folders to back up the studio. To start fresh, stop the server and delete both folders; they are recreated automatically.

### Vercel

- Artworks and sales are in the connected Postgres database. Use the database provider's backup/export tools.
- Images are in the connected Vercel Blob store. Manage them from **Vercel → Storage → Blob**.

Both local folders are ignored by Git.

## How the sales flow works

1. You upload an artwork and set its price in **Dashboard → Add artwork**.
2. The piece appears on the home page and the shop.
3. A collector adds it to their cart and submits a purchase request with their contact details.
4. The artwork becomes **Reserved** and the request appears in **Dashboard → Sales → Pending**.
5. Once payment is confirmed, click **Mark paid**:
   - artwork becomes **Sold**
   - the sale counts toward revenue
6. If the request falls through, click **Cancel**:
   - artwork becomes **Available** again
   - the sale is kept as cancelled history
7. You can also record an offline/WhatsApp sale manually with **Record sale**.

The shop does **not** collect payment online. It collects a purchase request, and the studio arranges payment and delivery directly.

## Dashboard features

- Total artworks, available, reserved, sold and revenue stats
- Monthly revenue and pending-request count
- Add artwork with image upload, dimensions, medium, collection, year and price
- Edit any artwork's title, description, category, collection, medium, dimensions, year, price and status
- Search and filter artworks by status
- Record a paid sale with buyer details and notes
- Manage pending, paid and cancelled sales
- Delete artworks or sale records

## Project structure

```text
api/
  [...path].js      Vercel serverless entry for /api/*
server/
  app.js            Shared Express app (routes, auth, uploads)
  index.js          Local Node server + built frontend
  db.js             Runtime database dispatcher (SQLite or Postgres)
  db-sqlite.js      SQLite adapter (local)
  db-postgres.js    Postgres adapter (Vercel / Neon)
  auth.js           Password verification and signed session tokens
  http.js           Shared 404 and error-handling middleware
  data/             SQLite database (ignored by Git)
  uploads/          Local artwork images (ignored by Git)

src/
  lib/api.js        Frontend API client and token handling
  context/          Shopping cart state
  component/        Shared UI, shop sections and dashboard modals
  pages/            Home, Shop, Cart, Login, Dashboard, Add artwork

vercel.json         Vercel build/runtime configuration
.env.local          Local admin credentials (ignored by Git)
.env.example        Template for environment variables
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start frontend + backend for development |
| `npm run dev:client` | Start only the Vite frontend |
| `npm run dev:server` | Start only the Node API |
| `npm run build` | Build the frontend into `dist/` |
| `npm start` | Run the production Node server (build first) |
| `npm run lint` | Run ESLint |

## Security checklist

- [ ] Change `ADMIN_PASSWORD` and `AUTH_SECRET` before putting the site online.
- [ ] Set the same values in Vercel's environment settings, never in a committed file.
- [ ] Keep `.env.local`, `server/data/` and `server/uploads/` private.
- [ ] Back up your Postgres database and Blob store regularly.
- [ ] Use HTTPS in production (Vercel provides it automatically).
- [ ] Do not reuse the development password on the public site.

## Troubleshooting

**`POST /api/auth/login 405 (Method Not Allowed)` on Vercel** — the API function was not deployed. Confirm `api/[...path].js` exists in the repository, check the Vercel **Functions** tab, and redeploy the latest commit.

**`/api/health` returns the HTML page** — the SPA rewrite is handling the API path, which means no API function matched. Make sure the deployment includes `api/[...path].js`, that `vercel.json` is committed with the `/api/:path*` rewrite, and that the latest commit was deployed.

**Login works but adding an artwork fails** — open `/api/config`. If `storage` is `unconfigured`, connect a Vercel Blob store and redeploy so `BLOB_READ_WRITE_TOKEN` is available. If it is `disk`, the deployment is writing to a temporary filesystem; connect Blob.

**Data disappears on Vercel** — make sure a Postgres database is connected and `/api/health` reports `"database":"postgres"`. Without it, the app falls back to SQLite, which cannot persist on serverless functions.

**Uploaded images disappear after redeploy** — local disk storage is ephemeral on serverless hosts. Use Vercel Blob (or another persistent object store).

**`EADDRINUSE` on port 5174** — another server is already running. Stop it, or change `PORT` in `.env.local` and update the Vite proxy in `vite.config.js`.

**The admin login says the server is unreachable** — make sure `npm run dev` is running both processes, or that `npm start` is running for production.

**I forgot my login** — edit the environment variables and restart (locally) or redeploy (Vercel). Credentials are not stored in the database.

**Reset the local installation** — stop the server, delete `server/data/` and `server/uploads/`, then start again.
