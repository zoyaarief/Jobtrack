/*
api.js — quick review notes 

• Base URL & env:
  - Read API base from import.meta.env.VITE_API_URL (fallback to "") and prefix all fetches.

• 401 handling / refresh:
  - If response.status === 401, throw a custom AuthError so callers can auto-logout or trigger token refresh.

• Timeouts & cancellation:
  - Accept an optional { signal } or add an AbortController with a default timeout (e.g., 15s).

• Robust JSON handling:
  - Handle 204/empty bodies safely; only call response.json() when content-length > 0 and content-type is application/json.
  - Return { data, ok, status } shape; include original response.status for callers.

• Error normalization:
  - Normalize server errors to { message, code, status, details }.
  - Special-case 429: read Retry-After and surface it for backoff.

• Retries / backoff (idempotent reads):
  - Add a small retry for GET on network errors/429 with exponential backoff.

• Headers / tokens:
  - Memoize auth headers; allow extra headers via options.headers (don’t clobber).
  - Support credentials: 'include' when using HttpOnly cookies (else keep Bearer).

• Query helpers:
  - Add qs(params) to build query strings safely (encodeURIComponent), e.g., list({ page, limit, q }).

• Content types:
  - If input is FormData, omit 'Content-Type' so the browser sets multipart boundaries.
  - For JSON, keep 'Content-Type: application/json'.

• Security:
  - Never log tokens; strip PII from thrown errors in production.
  - If moving to cookies, add CSRF token header and sameSite=strict server-side.

• DX / typing:
  - Consider TypeScript types for ApiResponse<T> and strong typing for endpoints.
  - Surface api.* methods that accept { signal, params, headers } for flexibility.

• Caching layer:
  - Pair with React Query/TanStack Query on the UI for caching, retries, dedupe, and request cancellation.

• Idempotency:
  - For create(), optionally send an 'Idempotency-Key' header (UUID) to avoid duplicate posts on retries.

*/



const defaultHeaders = {
  "Content-Type": "application/json",
};

function authHeaders(token) {
  return token
    ? {
        ...defaultHeaders,
        Authorization: `Bearer ${token}`,
      }
    : defaultHeaders;
}

async function handleJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;
  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  async register(input) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(input),
    });
    return handleJsonResponse(res);
  },

  async login(input) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(input),
    });
    return handleJsonResponse(res);
  },

  async me(token) {
    const res = await fetch("/api/auth/me", {
      headers: authHeaders(token),
    });
    return handleJsonResponse(res);
  },

  profile: {
    async update(token, input) {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(input),
      });
      return handleJsonResponse(res);
    },
    async updatePassword(token, input) {
      const res = await fetch("/api/auth/me/password", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(input),
      });
      return handleJsonResponse(res);
    },
  },

  applications: {
    async list(token) {
      const res = await fetch("/api/applications", {
        headers: authHeaders(token),
      });
      return handleJsonResponse(res);
    },
    async get(token, id) {
      const res = await fetch(`/api/applications/${id}`, {
        headers: authHeaders(token),
      });
      return handleJsonResponse(res);
    },
    async create(token, input) {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(input),
      });
      return handleJsonResponse(res);
    },
    async update(token, id, input) {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify(input),
      });
      return handleJsonResponse(res);
    },
    async remove(token, id) {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      return handleJsonResponse(res);
    },
  },
};
