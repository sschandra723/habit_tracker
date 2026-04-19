import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken]   = useState(() => localStorage.getItem("token"));
    const [user, setUser]     = useState(null);
    const [loading, setLoading] = useState(true);

    const API = process.env.REACT_APP_API_URL || "http://localhost:8080";

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        // Validate token by fetching user profile
        fetch(`${API}/api/users/me`, {
            headers: { Authorization: "Bearer " + token },
        })
            .then(r => {
                if (!r.ok) throw new Error("Invalid token");
                return r.json();
            })
            .then(u => setUser(u))
            .catch(() => {
                // Token invalid — clear it
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, [token, API]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const refreshUser = () => {
        if (!token) return;
        fetch(`${API}/api/users/me`, {
            headers: { Authorization: "Bearer " + token },
        }).then(r => r.ok ? r.json() : null).then(u => { if (u) setUser(u); });
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

// Axios-style interceptor helper (used in apiFetch)
export function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: "Bearer " + token } : {};
}