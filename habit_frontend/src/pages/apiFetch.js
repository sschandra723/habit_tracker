// apiFetch.js — centralized fetch helper
// NEVER shows raw JDBC/SQL errors to users — always shows a friendly message.

export const API = process.env.REACT_APP_API_URL || "http://localhost:8080";

export function getToken() { return localStorage.getItem("token"); }

export function showToast(message, type = "error") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
}

// Friendly messages for common backend errors
function friendlyMessage(raw) {
    if (!raw) return "Something went wrong. Please try again.";
    const r = raw.toLowerCase();
    if (r.includes("jdbc") || r.includes("sql") || r.includes("hibernate") ||
        r.includes("transaction") || r.includes("prepared statement")) {
        return "A server error occurred. Please try again.";
    }
    if (r.includes("user not found"))   return "Account not found.";
    if (r.includes("access denied"))    return "You don't have permission to do that.";
    if (r.includes("habit not found"))  return "Habit not found — it may have been deleted.";
    if (r.includes("already marked"))   return "Already marked today!";
    if (r.includes("already registered")) return "That email is already registered.";
    if (r.includes("invalid password")) return "Incorrect password.";
    return raw.length > 120 ? "Something went wrong. Please try again." : raw;
}

/**
 * @param {string} path        - e.g. "/api/habits"
 * @param {object} options     - fetch options
 * @param {object} cfg
 * @param {boolean} cfg.silent - if true, never show toast (used for background card refreshes)
 */
export async function apiFetch(path, options = {}, { silent = false } = {}) {
    try {
        const res = await fetch(API + path, {
            ...options,
            headers: {
                Authorization: "Bearer " + getToken(),
                ...(options.headers || {}),
            },
        });

        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            window.location.href = "/auth";
            return null;
        }

        if (res.status === 204) return null;

        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch { data = null; }

        if (!res.ok) {
            const raw = data?.message || data?.error || `Error ${res.status}`;
            if (!silent) showToast(friendlyMessage(raw), "error");
            return null;
        }

        return data;
    } catch {
        if (!silent) showToast("Network error — check your connection.", "error");
        return null;
    }
}