import React, { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // ✅ Backend returns { accessToken, refreshToken }
                localStorage.setItem("token", data.accessToken);
                window.location.href = "/dashboard";
            } else {
                alert(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Backend not reachable!");
        }
    };

    // ... styles unchanged
    const styles = {
        container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0a1633" },
        card: { background: "#1e2b45", padding: "40px", borderRadius: "12px", width: "320px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", textAlign: "center" },
        title: { color: "white", marginBottom: "25px", fontSize: "36px", fontWeight: "bold" },
        input: { width: "100%", padding: "12px", margin: "10px 0", borderRadius: "6px", border: "none", outline: "none", fontSize: "14px", boxSizing: "border-box" },
        button: { width: "100%", padding: "12px", marginTop: "14px", borderRadius: "6px", border: "none", background: "#6366f1", color: "white", fontSize: "16px", cursor: "pointer" },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="test1@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
                    <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
            </div>
        </div>
    );
}

export default Login;