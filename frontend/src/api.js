/* --------------------------------------------------------------------------
   BASE URL CONFIGURATION
   If we are in production (Vite build), use the full backend URL.
   If we are in development (localhost), use the proxy.
--------------------------------------------------------------------------- */
const BASE_URL = import.meta.env.PROD
    ? "https://jobtrack-backend.onrender.com"
    : "";

const defaultHeaders = {
    "Content-Type": "application/json",
};

function authHeaders(token) {
    return token
        ? { ...defaultHeaders, Authorization: `Bearer ${token}` }
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

// Helper to wrap fetch so we don't have to type BASE_URL every time
async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, options);
    return handleJsonResponse(res);
}

export const api = {
    /* ---------------- AUTH ---------------- */
    async register(input) {
        return request("/api/auth/register", {
            method: "POST",
            headers: defaultHeaders,
            body: JSON.stringify(input),
        });
    },

    async login(input) {
        return request("/api/auth/login", {
            method: "POST",
            headers: defaultHeaders,
            body: JSON.stringify(input),
        });
    },

    async me(token) {
        return request("/api/auth/me", {
            headers: authHeaders(token),
        });
    },

    profile: {
        async update(token, input) {
            return request("/api/auth/me", {
                method: "PUT",
                headers: authHeaders(token),
                body: JSON.stringify(input),
            });
        },

        async updatePassword(token, input) {
            return request("/api/auth/me/password", {
                method: "PUT",
                headers: authHeaders(token),
                body: JSON.stringify(input),
            });
        },
    },

    /* ---------------- APPLICATIONS ---------------- */
    applications: {
        async list(token) {
            return request("/api/applications", {
                headers: authHeaders(token),
            });
        },
        async get(token, id) {
            return request(`/api/applications/${id}`, {
                headers: authHeaders(token),
            });
        },
        async create(token, input) {
            return request("/api/applications", {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(input),
            });
        },
        async update(token, id, input) {
            return request(`/api/applications/${id}`, {
                method: "PUT",
                headers: authHeaders(token),
                body: JSON.stringify(input),
            });
        },
        async remove(token, id) {
            return request(`/api/applications/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });
        },
    },

    /* ---------------- INTERVIEW HUB ---------------- */
    companies: {
        async list(search = "") {
            const query = search ? `?search=${encodeURIComponent(search)}` : "";
            return request(`/api/companies${query}`);
        },
    },

    questions: {
        async create(token, input) {
            return request("/api/questions", {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(input),
            });
        },

        async listByCompany(company, page = 1, limit = 10, sort = "") {
            const params = new URLSearchParams();
            params.append("company", company);
            params.append("page", page);
            params.append("limit", limit);
            if (sort) params.append("sort", sort);

            return request(`/api/questions?${params.toString()}`);
        },

        async get(id) {
            return request(`/api/questions/${id}`);
        },

        async update(token, id, input) {
            return request(`/api/questions/${id}`, {
                method: "PUT",
                headers: authHeaders(token),
                body: JSON.stringify(input),
            });
        },

        async remove(token, id) {
            return request(`/api/questions/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });
        },
    },
};