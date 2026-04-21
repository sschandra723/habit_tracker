import React, { useState, useEffect } from "react";

const API =process.env.REACT_APP_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background: #04080f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .auth-bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
  }

  .auth-card {
    width: 420px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 44px 40px 40px;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(20px);
  }

  .auth-logo {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #4ade80;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-decoration: none;
  }

  .auth-logo-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 10px #4ade80;
  }

  .auth-title {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.15;
    margin-bottom: 6px;
  }

  .auth-subtitle {
    font-size: 14px;
    color: #475569;
    margin-bottom: 32px;
  }

  .auth-tabs {
    display: flex;
    background: rgba(255,255,255,0.04);
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 28px;
  }

  .auth-tab {
    flex: 1;
    padding: 9px;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
  }

  .auth-tab.active { background: #4ade80; color: #04080f; }

  .auth-field { margin-bottom: 14px; }

  .auth-label {
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
  }

  .auth-input {
    width: 100%;
    padding: 12px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    color: #f1f5f9;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border 0.2s;
  }

  .auth-input:focus { border-color: #4ade80; }
  .auth-input.error { border-color: #f87171; }

  .auth-error {
    font-size: 12px;
    color: #f87171;
    margin-top: 4px;
  }

  .auth-server-error {
    background: rgba(248,113,113,0.08);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #f87171;
    margin-bottom: 16px;
  }

  .auth-btn {
    width: 100%;
    padding: 13px;
    background: #4ade80;
    color: #04080f;
    border: none;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.2s, transform 0.1s;
    letter-spacing: 0.02em;
  }

  .auth-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .auth-btn:active { transform: scale(0.97); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .auth-back {
    font-size: 12px; color: #334155; margin-top: 20px;
    text-align: center; cursor: pointer; transition: color 0.15s;
  }
  .auth-back:hover { color: #4ade80; }
  .auth-back a { color: inherit; text-decoration: none; }

  .auth-strength { display: flex; gap: 4px; margin-top: 6px; }
  .auth-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: #1e293b; transition: background 0.3s; }
`;

function getPasswordStrength(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6)          s++;
    if (pw.length >= 10)         s++;
    if (/[A-Z]/.test(pw))       s++;
    if (/[0-9]/.test(pw))       s++;
    if (/[^A-Za-z0-9]/.test(pw))s++;
    return s;
}

const strengthColors = ["#f87171","#fb923c","#fbbf24","#4ade80","#22c55e"];
const strengthLabels = ["","Weak","Fair","Good","Strong","Very Strong"];

export default function Auth() {
    // Read ?tab=signup from the URL (set by landing page CTA)
    const initialTab = new URLSearchParams(window.location.search).get("tab") === "signup" ? "signup" : "login";
    const [tab, setTab]               = useState(initialTab);
    const [loading, setLoading]       = useState(false);
    const [serverError, setServerError] = useState("");

    const [loginEmail, setLoginEmail]       = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginErrors, setLoginErrors]     = useState({});

    const [signupName, setSignupName]         = useState("");
    const [signupEmail, setSignupEmail]       = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirm, setSignupConfirm]   = useState("");
    const [signupErrors, setSignupErrors]     = useState({});

    const pwStrength = getPasswordStrength(signupPassword);

    useEffect(() => { setServerError(""); setLoginErrors({}); setSignupErrors({}); }, [tab]);

    const validateLogin = () => {
        const e = {};
        if (!loginEmail.trim()) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(loginEmail)) e.email = "Invalid email";
        if (!loginPassword) e.password = "Password is required";
        setLoginErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async (ev) => {
        ev.preventDefault();
        if (!validateLogin()) return;
        setLoading(true); setServerError("");
        try {
            const res  = await fetch(`${API}/api/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.accessToken);
                window.location.href = "/dashboard";
            } else {
                setServerError(data.message || "Login failed. Check your credentials.");
            }
        } catch {
            setServerError("Cannot reach server. Is the backend running?");
        }
        setLoading(false);
    };

    const validateSignup = () => {
        const e = {};
        if (!signupName.trim())   e.name    = "Name is required";
        if (!signupEmail.trim())  e.email   = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(signupEmail)) e.email = "Invalid email";
        if (!signupPassword)      e.password = "Password is required";
        else if (signupPassword.length < 6) e.password = "Minimum 6 characters";
        if (signupPassword !== signupConfirm) e.confirm = "Passwords do not match";
        setSignupErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSignup = async (ev) => {
        ev.preventDefault();
        if (!validateSignup()) return;
        setLoading(true); setServerError("");
        try {
            const res  = await fetch(`${API}/api/auth/signup`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }) });
            const data = await res.json();
            if (res.ok) {
                const loginRes  = await fetch(`${API}/api/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: signupEmail, password: signupPassword }) });
                const loginData = await loginRes.json();
                if (loginRes.ok) {
                    localStorage.setItem("token", loginData.accessToken);
                    window.location.href = "/select-habits";
                }
            } else {
                setServerError(data.message || "Signup failed.");
            }
        } catch {
            setServerError("Cannot reach server. Is the backend running?");
        }
        setLoading(false);
    };

    return (
        <>
            <style>{styles}</style>
            <div className="auth-root">
                <div className="auth-bg-orb" style={{ width:400, height:400, background:"rgba(74,222,128,0.06)", top:-100, left:-100 }} />
                <div className="auth-bg-orb" style={{ width:300, height:300, background:"rgba(99,102,241,0.06)", bottom:-80, right:-80 }} />

                <div className="auth-card">
                    {/* Back to landing */}
                    <a href="/" className="auth-logo">
                        <div className="auth-logo-dot" />
                        HabitTracker
                    </a>

                    <h1 className="auth-title">
                        {tab === "login" ? "Welcome back." : "Start your journey."}
                    </h1>
                    <p className="auth-subtitle">
                        {tab === "login" ? "Sign in to track your habits." : "Create an account to get started."}
                    </p>

                    <div className="auth-tabs">
                        <button className={`auth-tab${tab==="login"?" active":""}`} onClick={()=>setTab("login")}>Login</button>
                        <button className={`auth-tab${tab==="signup"?" active":""}`} onClick={()=>setTab("signup")}>Sign Up</button>
                    </div>

                    {serverError && <div className="auth-server-error">{serverError}</div>}

                    {tab === "login" && (
                        <form onSubmit={handleLogin} noValidate>
                            <div className="auth-field">
                                <label className="auth-label">Email</label>
                                <input className={`auth-input${loginErrors.email?" error":""}`} type="email" placeholder="you@example.com" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} />
                                {loginErrors.email && <div className="auth-error">{loginErrors.email}</div>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <input className={`auth-input${loginErrors.password?" error":""}`} type="password" placeholder="••••••••" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} />
                                {loginErrors.password && <div className="auth-error">{loginErrors.password}</div>}
                            </div>
                            <button className="auth-btn" type="submit" disabled={loading}>
                                {loading ? "Signing in…" : "Sign In →"}
                            </button>
                        </form>
                    )}

                    {tab === "signup" && (
                        <form onSubmit={handleSignup} noValidate>
                            <div className="auth-field">
                                <label className="auth-label">Full Name</label>
                                <input className={`auth-input${signupErrors.name?" error":""}`} type="text" placeholder="John Doe" value={signupName} onChange={e=>setSignupName(e.target.value)} />
                                {signupErrors.name && <div className="auth-error">{signupErrors.name}</div>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Email</label>
                                <input className={`auth-input${signupErrors.email?" error":""}`} type="email" placeholder="you@example.com" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)} />
                                {signupErrors.email && <div className="auth-error">{signupErrors.email}</div>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <input className={`auth-input${signupErrors.password?" error":""}`} type="password" placeholder="Min. 6 characters" value={signupPassword} onChange={e=>setSignupPassword(e.target.value)} />
                                {signupPassword && (
                                    <>
                                        <div className="auth-strength">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="auth-strength-bar"
                                                     style={{ background: i <= pwStrength ? strengthColors[pwStrength-1] : undefined }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize:11, color:strengthColors[pwStrength-1], marginTop:3 }}>
                                            {strengthLabels[pwStrength]}
                                        </div>
                                    </>
                                )}
                                {signupErrors.password && <div className="auth-error">{signupErrors.password}</div>}
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Confirm Password</label>
                                <input className={`auth-input${signupErrors.confirm?" error":""}`} type="password" placeholder="Re-enter password" value={signupConfirm} onChange={e=>setSignupConfirm(e.target.value)} />
                                {signupErrors.confirm && <div className="auth-error">{signupErrors.confirm}</div>}
                            </div>
                            <button className="auth-btn" type="submit" disabled={loading}>
                                {loading ? "Creating account…" : "Create Account →"}
                            </button>
                        </form>
                    )}

                    <div className="auth-back">
                        <a href="/">← Back to home</a>
                    </div>
                </div>
            </div>
        </>
    );
}