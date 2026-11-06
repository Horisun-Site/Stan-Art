const TOKEN_KEY = "stanart_admin_token";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage can be unavailable in private browsing. The session will
    // simply not survive a page refresh.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors.
  }
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new ApiError(
      "Could not reach the studio server. Is it running?",
      0,
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login") {
      clearToken();
    }

    throw new ApiError(
      data?.error || "Something went wrong. Please try again.",
      response.status,
    );
  }

  return data;
}

/* Auth ------------------------------------------------------------- */

export async function loginAdmin(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });

  setToken(data.token);
  return data.user;
}

export function logoutAdmin() {
  clearToken();
}

export async function fetchMe() {
  const data = await request("/auth/me");
  return data.user;
}

/* Artworks --------------------------------------------------------- */

export async function fetchArtworks(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await request(`/artworks${query}`);
  return data.artworks;
}

export async function createArtwork(formData) {
  const data = await request("/artworks", {
    method: "POST",
    body: formData,
  });
  return data.artwork;
}

export async function updateArtwork(id, updates) {
  const data = await request(`/artworks/${id}`, {
    method: "PATCH",
    body: updates,
  });
  return data.artwork;
}

export async function deleteArtwork(id) {
  await request(`/artworks/${id}`, { method: "DELETE" });
}

/* Sales ------------------------------------------------------------ */

export async function fetchSales(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const data = await request(`/sales${query}`);
  return data.sales;
}

export async function recordSale(sale) {
  const data = await request("/sales", {
    method: "POST",
    body: sale,
  });
  return data.sale;
}

export async function updateSaleStatus(id, status) {
  const data = await request(`/sales/${id}`, {
    method: "PATCH",
    body: { status },
  });
  return data.sale;
}

export async function deleteSale(id) {
  await request(`/sales/${id}`, { method: "DELETE" });
}

export async function fetchStats() {
  const data = await request("/stats");
  return data.stats;
}

/* Public purchase requests ---------------------------------------- */

export async function submitOrder({ items, customer, note }) {
  return request("/orders", {
    method: "POST",
    body: { items, customer, note },
  });
}
