import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@stanartstudio.com"
)
  .trim()
  .toLowerCase();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "StanArt2026!";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const secret =
  process.env.AUTH_SECRET ||
  createHmac("sha256", "stan-art-local-fallback")
    .update(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`)
    .digest("hex");

if (!process.env.AUTH_SECRET) {
  console.warn(
    "[auth] AUTH_SECRET is not set. Using a derived development secret. " +
      "Set AUTH_SECRET in .env.local before putting this online.",
  );
}

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    "[auth] ADMIN_PASSWORD is not set. Using the default development password. " +
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.",
  );
}

const passwordSalt = randomBytes(16);
const passwordHash = scryptSync(ADMIN_PASSWORD, passwordSalt, 64);

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyCredentials(email, password) {
  if (typeof email !== "string" || typeof password !== "string") {
    return false;
  }

  const emailMatches = safeEqual(
    Buffer.from(email.trim().toLowerCase()),
    Buffer.from(ADMIN_EMAIL),
  );

  const passwordMatches = safeEqual(
    scryptSync(password, passwordSalt, 64),
    passwordHash,
  );

  return emailMatches && passwordMatches;
}

function sign(payload) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createToken() {
  const payload = Buffer.from(
    JSON.stringify({
      sub: ADMIN_EMAIL,
      exp: Date.now() + TOKEN_TTL_MS,
    }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (typeof token !== "string") return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);

  if (!safeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (typeof data.exp !== "number" || data.exp < Date.now()) {
      return null;
    }

    if (data.sub !== ADMIN_EMAIL) return null;

    return { email: ADMIN_EMAIL, name: "Studio Admin" };
  } catch {
    return null;
  }
}

export function getAdminUser() {
  return { email: ADMIN_EMAIL, name: "Studio Admin" };
}

export function getAdminEmail() {
  return ADMIN_EMAIL;
}
