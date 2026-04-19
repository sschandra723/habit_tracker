import React from "react";
import { useAuth } from "./AuthContext";

// Wrap any route that requires login
export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", background: "#020917",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#1e3a5f", fontFamily: "'DM Sans',sans-serif",
            }}>
                ✦ Loading…
            </div>
        );
    }

    if (!token) {
        // Not logged in — redirect to auth page
        window.location.href = "/";
        return null;
    }

    return children;
}