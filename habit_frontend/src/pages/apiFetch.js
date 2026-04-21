// apiFetch.js — use this in ALL pages instead of raw fetch()
// It handles: 401 redirect, network errors, server errors, toast notifications

export const API = process.env.REACT_APP_API_URL;

export function getToken() {
    return localStorage.getItem("token");
}

export function showToast(message, type = "error") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
}

/**
 * @param {string} path         - e.g. "/api/habits"
 * @param {object} options      - fetch options (method, body, headers)
 * @param {object} cfg
 * @param {boolean} cfg.silent  - if true, don't show error toast
 * @returns {Promise<any|null>} - parsed JSON or null on failure
 */
export async function apiFetch(path, options = {}, { silent = false } = {}) {
    try {
        const token = getToken();

        const res = await fetch(API + path, {
            ...options,
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(options.headers || {}),
            },
        });

        // Token expired — clear and redirect
        if (res.status === 401) {
            const token = getToken();

            if (!token) {
                window.location.href = "/auth";
            } else {
                console.warn("Token expired or invalid");
                localStorage.removeItem("token");
                window.location.href = "/auth";
            }
            return null;
        }

        if (res.status === 204) return null;  // No content (DELETE etc.)

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
            const msg = data?.message || data?.error || `Server error (${res.status})`;
            if (!silent) showToast(msg, "error");
            return null;
        }

        return data;
    } catch {
        // Network error / CORS / offline
        if (!silent) showToast("Network error — check your connection", "error");
        return null;
    }
}