import React, { useEffect, useState, useCallback, useRef } from "react";
import { CONSTELLATIONS } from "./constellations";

const API = "http://localhost:8080";
function getToken() { return localStorage.getItem("token"); }

async function apiFetch(path, options = {}) {
    const res = await fetch(API + path, {
        ...options,
        headers: { "Authorization": "Bearer " + getToken(), ...(options.headers || {}) },
    });
    if (res.status === 401 || res.status === 403) { localStorage.removeItem("token"); window.location.href = "/"; return null; }
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes celebrate{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.04);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes tipIn{from{opacity:0;transform:translateX(-50%) translateY(5px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
`;

// ── Constellation map SVG (shown in hover popup) ──────────────────────────────
function ConstellationMapSVG({ constellation, completedDays }) {
    const [hIdx, setHIdx] = useState(null);
    if (!constellation) return null;
    const W = 340, H = 210, pad = 16;
    const px = nx => pad + (nx / 100) * (W - pad * 2);
    const py = ny => pad + (ny / 100) * (H - pad * 2);
    const { stars, lines, name, days } = constellation;
    return (
        <div style={{ position: "relative" }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", borderRadius: 10 }}>
                <defs>
                    <radialGradient id="mapbg" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="#0d1b35" /><stop offset="100%" stopColor="#020917" />
                    </radialGradient>
                    <filter id="mg" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <rect width={W} height={H} fill="url(#mapbg)" rx={10} />
                {Array.from({ length: 28 }).map((_, i) => (
                    <circle key={`a${i}`} cx={(((i * 137.5) % 100) / 100) * W} cy={(((i * 97.3) % 100) / 100) * H}
                            r={0.6} fill="#f0f9ff" fillOpacity={0.08 + (i % 4) * 0.04} />
                ))}
                {lines.map(([a, b], i) => {
                    const ad = a < completedDays, bd = b < completedDays;
                    return <line key={i} x1={px(stars[a].x)} y1={py(stars[a].y)} x2={px(stars[b].x)} y2={py(stars[b].y)}
                                 stroke={ad && bd ? "#b8d0f0" : ad !== bd ? "#1e3a5f" : "#0f1f35"}
                                 strokeWidth={ad && bd ? 1.2 : 0.6} strokeOpacity={ad && bd ? 0.55 : 0.3}
                                 strokeDasharray={ad !== bd ? "3 3" : undefined} />;
                })}
                {stars.map((s, i) => {
                    const done = i < completedDays, next = i === completedDays, hov = hIdx === i;
                    const r = done ? 4.5 : next ? 3 : 2;
                    return (
                        <g key={i} onMouseEnter={() => setHIdx(i)} onMouseLeave={() => setHIdx(null)} style={{ cursor: "default" }}>
                            <circle cx={px(s.x)} cy={py(s.y)} r={14} fill="transparent" />
                            {done && <circle cx={px(s.x)} cy={py(s.y)} r={hov ? 14 : 9} fill="#f0f9ff" fillOpacity={hov ? 0.12 : 0.05} style={{ transition: "r 0.15s" }} />}
                            {next && <circle cx={px(s.x)} cy={py(s.y)} r={8} fill="none" stroke="#60a5fa" strokeWidth={1} strokeOpacity={0.55} strokeDasharray="2 2" />}
                            <circle cx={px(s.x)} cy={py(s.y)} r={hov ? r + 2 : r}
                                    fill={done ? "#f0f9ff" : next ? "#1e3a5f" : "#0d1b2e"}
                                    filter={done ? "url(#mg)" : "none"} style={{ transition: "all 0.15s" }} />
                            {done && <>
                                <line x1={px(s.x)} y1={py(s.y) - r - 4} x2={px(s.x)} y2={py(s.y) + r + 4} stroke="#f0f9ff" strokeWidth={0.6} strokeOpacity={0.3} />
                                <line x1={px(s.x) - r - 4} y1={py(s.y)} x2={px(s.x) + r + 4} y2={py(s.y)} stroke="#f0f9ff" strokeWidth={0.6} strokeOpacity={0.3} />
                            </>}
                        </g>
                    );
                })}
                <text x={W - 10} y={H - 6} textAnchor="end" fontSize={10} fill="#1e3a5f" fontFamily="monospace">{completedDays}/{days}d</text>
            </svg>
            {hIdx !== null && (
                <div style={{
                    position: "absolute", top: 6, left: `${(stars[hIdx].x / 100) * W}px`,
                    transform: "translateX(-50%)",
                    background: "rgba(4,13,26,0.97)", border: "1px solid #1e3a5f",
                    borderRadius: 7, padding: "4px 11px",
                    fontSize: 11, fontWeight: 700, color: "#f1f5f9",
                    whiteSpace: "nowrap", pointerEvents: "none", zIndex: 30,
                }}>
                    Day {hIdx + 1}
                    {hIdx < completedDays
                        ? <span style={{ color: "#4ade80", marginLeft: 6 }}>✓ done</span>
                        : hIdx === completedDays
                            ? <span style={{ color: "#60a5fa", marginLeft: 6 }}>← next</span>
                            : <span style={{ color: "#334155", marginLeft: 6 }}>locked</span>}
                </div>
            )}
        </div>
    );
}

// ── Hover popup (appears above card on hover) ─────────────────────────────────
function ConstellationPopup({ habit, calendar, onSetConstellation }) {
    const c = CONSTELLATIONS.find(x => x.name === habit.targetConstellation);
    const startDate = habit.constellationStartDate ? new Date(habit.constellationStartDate) : null;
    const completedDays = c && startDate && Array.isArray(calendar)
        ? calendar.filter(d => new Date(d) >= startDate).length : 0;
    const pct = c ? Math.min(completedDays / c.days, 1) : 0;

    return (
        <div style={{
            position: "absolute", bottom: "calc(100% + 12px)", left: "50%",
            transform: "translateX(-50%)", zIndex: 50,
            filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.85))",
            animation: "tipIn 0.2s ease", pointerEvents: "auto",
        }}>
            <div style={{
                background: "#040d1a", border: "1px solid #1e3a5f",
                borderRadius: 16, padding: "16px 16px 12px", minWidth: 370,
            }}>
                {c ? (
                    <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div>
                                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: "#f1f5f9" }}>{c.name}</span>
                                <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, marginLeft: 10 }}>{c.days} day goal</span>
                            </div>
                            <button onClick={e => { e.stopPropagation(); onSetConstellation(); }} style={{
                                fontSize: 10, color: "#475569", background: "#0a1628",
                                border: "1px solid #1e293b", borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                            }}>change</button>
                        </div>
                        <div style={{ height: 3, background: "#0f1a2e", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
                            <div style={{
                                height: "100%", borderRadius: 2, width: `${pct * 100}%`,
                                background: pct >= 1 ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#6366f1,#8b5cf6)",
                                transition: "width 0.5s",
                            }} />
                        </div>
                        <ConstellationMapSVG constellation={c} completedDays={completedDays} />
                        <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>"{c.myth}"</div>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <div style={{ fontSize: 13, color: "#334155", marginBottom: 10 }}>No constellation goal set</div>
                        <button onClick={e => { e.stopPropagation(); onSetConstellation(); }} style={{
                            padding: "8px 20px", background: "#0a1628",
                            border: "1.5px dashed #1e3a5f", borderRadius: 8,
                            color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}>✦ Set a goal</button>
                    </div>
                )}
            </div>
            <div style={{
                width: 12, height: 12, background: "#040d1a",
                border: "1px solid #1e3a5f", borderTop: "none", borderLeft: "none",
                transform: "rotate(45deg)", margin: "-7px auto 0",
            }} />
        </div>
    );
}

// ── Constellation Picker Modal ────────────────────────────────────────────────
function ConstellationPicker({ onSelect, onClose, current }) {
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(2,9,23,0.93)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, backdropFilter: "blur(8px)",
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                background: "#070f1e", border: "1px solid #1e293b", borderRadius: 20,
                padding: "32px 28px", maxWidth: 700, width: "90vw",
                maxHeight: "85vh", overflowY: "auto", animation: "celebrate 0.3s ease",
            }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
                    Choose your constellation
                </div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 24 }}>
                    Pick a streak goal. Each star = one day of consistency.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
                    {CONSTELLATIONS.map(c => {
                        const W = 166, H = 88, pad = 8;
                        const px = nx => pad + (nx / 100) * (W - pad * 2);
                        const py = ny => pad + (ny / 100) * (H - pad * 2);
                        const isCurrent = current === c.name;
                        return (
                            <button key={c.name} onClick={() => onSelect(c.name)} style={{
                                background: isCurrent ? "rgba(99,102,241,0.1)" : "#040d1a",
                                border: `1.5px solid ${isCurrent ? "#6366f1" : "#1e293b"}`,
                                borderRadius: 14, padding: "12px 12px 10px",
                                cursor: "pointer", textAlign: "left", transition: "all 0.18s",
                            }}
                                    onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.background = "#0a1628"; } }}
                                    onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.background = "#040d1a"; } }}
                            >
                                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 8, display: "block" }}>
                                    <rect width={W} height={H} fill="#020917" rx={8} />
                                    {c.lines.map(([a, b], i) => (
                                        <line key={i} x1={px(c.stars[a].x)} y1={py(c.stars[a].y)} x2={px(c.stars[b].x)} y2={py(c.stars[b].y)}
                                              stroke="#1e3a5f" strokeWidth={0.8} strokeOpacity={0.7} />
                                    ))}
                                    {c.stars.map((s, i) => <circle key={i} cx={px(s.x)} cy={py(s.y)} r={1.8} fill="#f0f9ff" fillOpacity={0.45} />)}
                                </svg>
                                <div style={{ marginTop: 9 }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{c.name}</div>
                                    <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, marginTop: 2 }}>{c.days} days</div>
                                    <div style={{ fontSize: 10, color: "#334155", marginTop: 3, lineHeight: 1.4 }}>{c.myth.slice(0, 55)}…</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} style={{
                    marginTop: 24, padding: "10px 28px", background: "#1e293b",
                    border: "none", borderRadius: 10, color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>Cancel</button>
            </div>
        </div>
    );
}

// ── Celebration overlay ───────────────────────────────────────────────────────
function Celebration({ constellation, onDismiss }) {
    useEffect(() => { const t = setTimeout(onDismiss, 7000); return () => clearTimeout(t); }, [onDismiss]);
    const W = 360, H = 230, pad = 18;
    const px = nx => pad + (nx / 100) * (W - pad * 2);
    const py = ny => pad + (ny / 100) * (H - pad * 2);
    const { stars, lines, name, days, myth } = constellation;
    return (
        <div style={{
            position: "fixed", inset: 0, background: "rgba(2,9,23,0.97)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            zIndex: 300,
        }}>
            <div style={{ animation: "float 3s ease infinite", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>✨</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>
                    You formed {name}!
                </div>
                <div style={{ fontSize: 14, color: "#64748b", maxWidth: 380, lineHeight: 1.7, marginBottom: 6 }}>{myth}</div>
                <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 700, marginBottom: 28 }}>{days} days of consistency 🔥</div>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 14 }}>
                    <defs>
                        <radialGradient id="celbg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0d1b35" /><stop offset="100%" stopColor="#020917" /></radialGradient>
                        <filter id="cg" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    </defs>
                    <rect width={W} height={H} fill="url(#celbg)" rx={14} />
                    {lines.map(([a, b], i) => <line key={i} x1={px(stars[a].x)} y1={py(stars[a].y)} x2={px(stars[b].x)} y2={py(stars[b].y)} stroke="#c7d9f5" strokeWidth={1.2} strokeOpacity={0.6} />)}
                    {stars.map((s, i) => (
                        <g key={i}>
                            <circle cx={px(s.x)} cy={py(s.y)} r={10} fill="#f0f9ff" fillOpacity={0.06} />
                            <circle cx={px(s.x)} cy={py(s.y)} r={4.5} fill="#f0f9ff" filter="url(#cg)" />
                            <line x1={px(s.x)} y1={py(s.y)-8} x2={px(s.x)} y2={py(s.y)+8} stroke="#f0f9ff" strokeWidth={0.7} strokeOpacity={0.4} />
                            <line x1={px(s.x)-8} y1={py(s.y)} x2={px(s.x)+8} y2={py(s.y)} stroke="#f0f9ff" strokeWidth={0.7} strokeOpacity={0.4} />
                        </g>
                    ))}
                </svg>
            </div>
            <button onClick={onDismiss} style={{
                marginTop: 32, padding: "13px 40px", background: "#4ade80", color: "#04080f",
                border: "none", borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, cursor: "pointer",
            }}>Choose Next Target →</button>
        </div>
    );
}

// ── Profile dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ onLogout }) {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const ref = useRef();
    useEffect(() => { apiFetch("/api/users/me").then(d => { if (d) setUser(d); }); }, []);
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button onClick={() => setOpen(o => !o)} style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "2px solid rgba(255,255,255,0.1)",
                color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>{initials}</button>
            {open && (
                <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 10px)",
                    background: "#0a1628", border: "1px solid #1e293b",
                    borderRadius: 14, minWidth: 220, padding: 6,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.7)", zIndex: 100,
                }}>
                    <div style={{ padding: "12px 14px 14px", borderBottom: "1px solid #1e293b", marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>{initials}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{user?.name || "—"}</div>
                                <div style={{ fontSize: 12, color: "#475569" }}>{user?.email || "—"}</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onLogout}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            style={{ width: "100%", padding: "10px 14px", background: "transparent", border: "none", borderRadius: 8, color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}>
                        ↩ Logout
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Habit Card ────────────────────────────────────────────────────────────────
function HabitCard({ habit, onDelete, onUpdate, onCelebrate }) {
    const [streak, setStreak]     = useState(0);
    const [longest, setLongest]   = useState(0);
    const [weekly, setWeekly]     = useState(0);
    const [marked, setMarked]     = useState(false);
    const [calendar, setCalendar] = useState([]);
    const [loading, setLoading]   = useState(false);
    const [editing, setEditing]   = useState(false);
    const [editName, setEditName] = useState(habit.name);
    const [editDesc, setEditDesc] = useState(habit.description || "");
    const [showPicker, setShowPicker] = useState(false);
    const [saveMsg, setSaveMsg]   = useState("");
    const [hovered, setHovered]   = useState(false);

    const loadStats = useCallback(async () => {
        const [s, w, lng, cal] = await Promise.all([
            apiFetch(`/api/logs/${habit.id}/streak`),
            apiFetch(`/api/logs/${habit.id}/weekly`),
            apiFetch(`/api/logs/${habit.id}/longest-streak`),
            apiFetch(`/api/logs/${habit.id}/calendar`),
        ]);
        if (s)   setStreak(s.streak);
        if (w)   setWeekly(w.completedDays);
        if (lng) setLongest(lng.Streak);
        if (cal) {
            setCalendar(cal);
            const today = new Date().toISOString().split("T")[0];
            setMarked(Array.isArray(cal) && cal.some(d => String(d).startsWith(today)));
        }
    }, [habit.id]);

    useEffect(() => { loadStats(); }, [loadStats]);

    const checkCelebration = useCallback((calDates, h) => {
        const c = CONSTELLATIONS.find(x => x.name === h.targetConstellation);
        if (!c || !h.constellationStartDate) return;
        const start = new Date(h.constellationStartDate);
        const done = calDates.filter(d => new Date(d) >= start).length;
        if (done >= c.days) onCelebrate(c, h);
    }, [onCelebrate]);

    const toggleMark = async () => {
        setLoading(true);
        await apiFetch(`/api/logs/${habit.id}/mark`, { method: marked ? "DELETE" : "POST" });
        await loadStats();
        setLoading(false);
    };

    const handleSaveStreak = async () => {
        if (marked) { setSaveMsg("Already saved today! ✓"); setTimeout(() => setSaveMsg(""), 2000); return; }
        setLoading(true);
        await apiFetch(`/api/logs/${habit.id}/mark`, { method: "POST" });
        const cal = await apiFetch(`/api/logs/${habit.id}/calendar`);
        if (cal) {
            setCalendar(cal);
            const today = new Date().toISOString().split("T")[0];
            setMarked(cal.some(d => String(d).startsWith(today)));
            checkCelebration(cal, habit);
        }
        setSaveMsg("Streak saved! 🔥");
        setLoading(false);
        setTimeout(() => setSaveMsg(""), 2500);
    };

    const saveEdit = async () => {
        const updated = await apiFetch(`/api/habits/${habit.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editName, description: editDesc }),
        });
        if (updated) { onUpdate(updated); setEditing(false); }
    };

    const handleSetConstellation = async (name) => {
        const updated = await apiFetch(`/api/habits/${habit.id}/constellation`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ constellation: name }),
        });
        if (updated) onUpdate(updated);
        setShowPicker(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${habit.name}"?`)) return;
        await apiFetch(`/api/habits/${habit.id}`, { method: "DELETE" });
        onDelete(habit.id);
    };

    return (
        <>
            {showPicker && (
                <ConstellationPicker current={habit.targetConstellation}
                                     onSelect={handleSetConstellation} onClose={() => setShowPicker(false)} />
            )}
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: "relative",
                    background: "linear-gradient(160deg,#070f1e,#0a1628)",
                    border: marked ? "1.5px solid rgba(240,249,255,0.18)" : hovered ? "1.5px solid #1e3a5f" : "1.5px solid #0f1a2e",
                    borderRadius: 20, padding: "20px",
                    display: "flex", flexDirection: "column", gap: 13,
                    transition: "border 0.3s, box-shadow 0.3s",
                    boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.6)" : marked ? "0 0 24px rgba(240,249,255,0.04)" : "none",
                    animation: "fadeIn 0.3s ease",
                }}
            >
                {/* Constellation popup on hover */}
                {hovered && (
                    <ConstellationPopup habit={habit} calendar={calendar}
                                        onSetConstellation={() => { setHovered(false); setShowPicker(true); }} />
                )}

                {/* Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    {editing ? (
                        <div style={{ flex: 1, marginRight: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                            <input value={editName} onChange={e => setEditName(e.target.value)} style={INP} placeholder="Habit name" />
                            <input value={editDesc} onChange={e => setEditDesc(e.target.value)} style={INP} placeholder="Description" />
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={saveEdit} style={SMB("#4ade80","#04080f")}>Save</button>
                                <button onClick={() => setEditing(false)} style={SMB("#1e293b","#94a3b8")}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 2 }}>{habit.name}</div>
                            {habit.description && <div style={{ fontSize: 12, color: "#334155" }}>{habit.description}</div>}
                        </div>
                    )}
                    {!editing && (
                        <div style={{ display: "flex", gap: 5 }}>
                            <button onClick={() => setEditing(true)} style={ICN("#0f172a")}>✎</button>
                            <button onClick={handleDelete} style={ICN("#0f172a","#f87171")}>✕</button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center" }}>
                    <span style={{
                        background: streak > 0 ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "#0f172a",
                        color: streak > 0 ? "#fff" : "#334155",
                        borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                    }}>
                        {streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "✦"} {streak}d streak
                    </span>
                    {longest > 0 && (
                        <span style={{ fontSize: 11, color: "#475569", background: "#0a1120", borderRadius: 999, padding: "2px 9px" }}>
                            Best: {longest}d
                        </span>
                    )}
                    <div style={{ display: "flex", gap: 3 }}>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} style={{ width: 7, height: 16, borderRadius: 2, background: i < weekly ? "#f0f9ff" : "#0f1a2e" }} />
                        ))}
                    </div>
                </div>

                {/* Constellation hint bar */}
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 10px", background: "#040d1a",
                    borderRadius: 8, border: "1px solid #0f1a2e",
                }}>
                    {habit.targetConstellation ? (
                        <>
                            <span style={{ fontSize: 11, color: "#475569" }}>
                                ✦ <span style={{ color: "#6366f1", fontWeight: 600 }}>{habit.targetConstellation}</span>
                                <span style={{ color: "#1e3a5f" }}> · hover to see map</span>
                            </span>
                            <button onClick={() => setShowPicker(true)} style={{ fontSize: 10, color: "#334155", background: "transparent", border: "none", cursor: "pointer" }}>change</button>
                        </>
                    ) : (
                        <button onClick={() => setShowPicker(true)} style={{ fontSize: 11, color: "#334155", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, width: "100%", textAlign: "left" }}>
                            ✦ Set constellation goal →
                        </button>
                    )}
                </div>

                {/* Buttons */}
                <button onClick={toggleMark} disabled={loading} style={{
                    padding: "10px 0", borderRadius: 10, border: "none",
                    cursor: loading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14,
                    background: marked ? "linear-gradient(90deg,#f0f9ff,#e2e8f0)" : "linear-gradient(90deg,#0f1a2e,#1a2b42)",
                    color: marked ? "#04080f" : "#475569",
                    transition: "all 0.3s", opacity: loading ? 0.6 : 1,
                }}>{loading ? "…" : marked ? "✦ Shining Today" : "Mark as Done"}</button>

                <button onClick={handleSaveStreak} disabled={loading} style={{
                    padding: "9px 0", borderRadius: 10,
                    border: marked ? "1.5px solid #f59e0b" : "1.5px dashed #1e3a5f",
                    background: "transparent", cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: 600, fontSize: 13,
                    color: marked ? "#f59e0b" : "#1e3a5f", transition: "all 0.2s",
                }}>🔥 Save Streak</button>

                {saveMsg && <div style={{ textAlign: "center", fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{saveMsg}</div>}
            </div>
        </>
    );
}

// ── Add Habit Form ────────────────────────────────────────────────────────────
function AddHabitForm({ onAdd }) {
    const [name, setName] = useState(""), [desc, setDesc] = useState(""), [loading, setLoading] = useState(false), [open, setOpen] = useState(false);
    const submit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const data = await apiFetch("/api/habits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), description: desc.trim() }) });
        if (data) { onAdd(data); setName(""); setDesc(""); setOpen(false); }
        setLoading(false);
    };
    return (
        <div style={{ marginBottom: 28 }}>
            {!open ? (
                <button onClick={() => setOpen(true)} style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'Syne',sans-serif", boxShadow: "0 4px 20px rgba(99,102,241,0.3)" }}>+ New Habit</button>
            ) : (
                <div style={{ background: "#070f1e", border: "1.5px solid #0f1a2e", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: "#f1f5f9", fontSize: 15 }}>New Habit</div>
                    <input value={name} onChange={e => setName(e.target.value)} style={INP} placeholder="Habit name *" />
                    <input value={desc} onChange={e => setDesc(e.target.value)} style={INP} placeholder="Description (optional)" />
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={submit} disabled={loading || !name.trim()} style={{ ...SMB("#6366f1","#fff"), padding: "9px 22px", opacity: loading || !name.trim() ? 0.6 : 1 }}>{loading ? "Adding…" : "Add Habit"}</button>
                        <button onClick={() => setOpen(false)} style={SMB("#0f172a","#94a3b8")}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Dashboard Root ────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [celebration, setCelebration] = useState(null);
    const [celebrationHabit, setCelebrationHabit] = useState(null);
    const [showNextPicker, setShowNextPicker] = useState(false);

    useEffect(() => {
        if (!getToken()) { window.location.href = "/"; return; }
        apiFetch("/api/habits").then(data => { if (data) setHabits(data); setLoading(false); });
    }, []);

    const handleCelebrate = useCallback((constellation, habit) => { setCelebration(constellation); setCelebrationHabit(habit); }, []);
    const handleCelebrationDismiss = () => { setCelebration(null); setShowNextPicker(true); };
    const handleNextPick = async (name) => {
        if (!celebrationHabit) return;
        const updated = await apiFetch(`/api/habits/${celebrationHabit.id}/constellation`, {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ constellation: name }),
        });
        if (updated) setHabits(p => p.map(h => h.id === updated.id ? updated : h));
        setShowNextPicker(false); setCelebrationHabit(null);
    };

    const handleLogout = () => { localStorage.removeItem("token"); window.location.href = "/"; };
    const handleAdd    = h  => setHabits(p => [...p, h]);
    const handleDelete = id => setHabits(p => p.filter(h => h.id !== id));
    const handleUpdate = u  => setHabits(p => p.map(h => h.id === u.id ? u : h));

    return (
        <>
            <style>{CSS}</style>
            {celebration && <Celebration constellation={celebration} onDismiss={handleCelebrationDismiss} />}
            {showNextPicker && <ConstellationPicker current={celebrationHabit?.targetConstellation} onSelect={handleNextPick} onClose={() => setShowNextPicker(false)} />}

            <div style={{ minHeight: "100vh", background: "#020917", color: "#f1f5f9", fontFamily: "'DM Sans','Segoe UI',sans-serif", paddingBottom: 60 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #070f1e", background: "rgba(2,9,23,0.92)", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
                    <div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>
                            <span style={{ color: "#f0f9ff", opacity: 0.4 }}>✦</span> HabitTracker
                        </div>
                        <div style={{ fontSize: 11, color: "#1e3a5f", marginTop: 1 }}>Map your stars · build your constellation</div>
                    </div>
                    <ProfileDropdown onLogout={handleLogout} />
                </div>

                <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px" }}>
                    {habits.length > 0 && (
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 12, padding: "14px 24px", display: "inline-block" }}>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#6366f1" }}>{habits.length}</div>
                                <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>Total Habits</div>
                            </div>
                        </div>
                    )}
                    <AddHabitForm onAdd={handleAdd} />
                    {loading ? (
                        <div style={{ textAlign: "center", color: "#1e3a5f", paddingTop: 80 }}>Mapping the stars…</div>
                    ) : habits.length === 0 ? (
                        <div style={{ textAlign: "center", paddingTop: 80 }}>
                            <div style={{ fontSize: 52, marginBottom: 14 }}>✦</div>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "#1e3a5f", marginBottom: 6 }}>No habits yet</div>
                            <div style={{ fontSize: 13, color: "#0f1a2e" }}>Add your first habit to start mapping constellations</div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                            {habits.map(h => (
                                <HabitCard key={h.id} habit={h} onDelete={handleDelete} onUpdate={handleUpdate} onCelebrate={handleCelebrate} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

const INP = { background: "#040d1a", border: "1px solid #0f1a2e", borderRadius: 8, padding: "9px 12px", color: "#f1f5f9", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
const SMB = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" });
const ICN = (bg, color = "#334155") => ({ background: bg, color, border: "none", borderRadius: 7, width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" });