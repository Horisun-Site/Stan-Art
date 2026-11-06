# Stan Art Studio

A contemporary art portfolio and studio shop built with React, Vite and Tailwind CSS. The site now runs on a **free, self-hosted Node + SQLite backend** instead of Firebase, so there is no paid database or image-storage bill.

## What changed

- **Firebase removed.** No Firestore, Firebase Auth or Firebase Storage is used anymore.
- **SQLite database.** Artwork and sales records live in `server/data/stan-art.db`.
- **Local image storage.** Uploaded artwork images are saved in `server/uploads/` and served by the studio server.
- **New admin login.** Email + password sign-in is verified by the server, with a signed session token.
- **Working shop.** Artworks added in the dashboard appear on the home page and in the shop.
- **Working cart.** Visitors can request to purchase an artwork; requests arrive in the dashboard as **pending sales**.
- **Working dashboard.** Overview stats, artwork management, price editing, sale recording and purchase-request management.

## Requirements

- Node.js **22.13 or newer** (the app uses Node's built-in `node:sqlite` module).
- npm.

## Quick start

```bash
npm install
npm run dev
```

- Site: http://localhost:5173
- Admin login: http://localhost:5173/login
- Admin dashboard: http://localhost:5173/admin
- API server: http://localhost:5174

`npm run dev` starts the Vite frontend and the Node server together. The frontend proxies `/api` and `/uploads` to the server.

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

## Production

```bash
npm run build
npm start
```

The server serves the built frontend from `dist/` and exposes the site at http://localhost:5174. It also serves uploaded images from `/uploads`.

## Data and backups

Everything important is in two folders:

| Path | Contents |
| --- | --- |
| `server/data/stan-art.db` | SQLite database (artworks, sales, prices, buyers) |
| `server/uploads/` | Uploaded artwork images |

To back up the studio, stop the server and copy both folders somewhere safe. To start fresh, stop the server and delete both folders; they are recreated automatically on the next start.

Both folders are ignored by Git, so your artwork data will not be committed.

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
server/
  index.js          Express API, auth, uploads and static frontend
  db.js             SQLite schema and database helpers
  auth.js           Password verification and signed session tokens
  data/             SQLite database (ignored by Git)
  uploads/          Artwork images (ignored by Git)

src/
  lib/api.js        Frontend API client and token handling
  context/          Shopping cart state
  component/        Shared UI, shop sections and dashboard modals
  pages/            Home, Shop, Cart, Login, Dashboard, Add artwork

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
| `npm start` | Run the production server (build first) |
| `npm run lint` | Run ESLint |

## Cost and hosting

Running locally is completely free and has no usage limits from a cloud provider.

For a live public site, this app needs a Node host with **persistent disk storage**, because SQLite and uploaded images are files on the server. Some free hosts use ephemeral filesystems, so data can reset on redeploy. Good options:

- Run it on a home computer or mini PC with a process manager.
- Use a Node host that includes a persistent volume.
- If you need a fully hosted free setup, the next step would be to swap SQLite + local files for **Supabase** (free Postgres + storage) or **Neon + Cloudinary**. The frontend already talks to a small API layer, so that migration would be contained to `server/`.

Firebase Storage was the part that required a paid Blaze plan. It is no longer part of this project, and the old Firebase keys have been removed from `.env.local`.

## Security checklist

- [ ] Change `ADMIN_PASSWORD` and `AUTH_SECRET` before putting the site online.
- [ ] Keep `.env.local` and `server/data/` private.
- [ ] Back up `server/data/` and `server/uploads/` regularly.
- [ ] Put the production server behind HTTPS.
- [ ] If you deploy, set environment variables in the host dashboard, not inside a committed file.

## Troubleshooting

**`EADDRINUSE` on port 5174** — another server is already running. Stop it, or change `PORT` in `.env.local` and update the Vite proxy in `vite.config.js`.

**The admin login says the server is unreachable** — make sure `npm run dev` is running both processes, or that `npm start` is running for production.

**Uploaded images disappear after redeploy** — the host is using an ephemeral filesystem. Move to a host with a persistent disk, or migrate image storage.

**I forgot my login** — edit `.env.local` and restart. The credentials are not stored anywhere else.

**Reset the installation** — stop the server, delete `server/data/` and `server/uploads/`, then start again.
