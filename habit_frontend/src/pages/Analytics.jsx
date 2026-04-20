import React, { useEffect, useState } from "react";
import { CONSTELLATIONS } from "./constellations";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080";
function getToken() { return localStorage.getItem("token"); }

async function apiFetch(path) {
    const res = await fetch(API + path, { headers: { Authorization: "Bearer " + getToken() } });
    if (res.status === 401) { localStorage.removeItem("token"); window.location.href = "/"; return null; }
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

// ─── Constellation preview for analytics (shows goal constellation forming) ───
function MiniConstellation({ constellationName, streak }) {
    const c = CONSTELLATIONS.find(x => x.name === constellationName);
    if (!c) return null;
    const W = 160, H = 90, p = 9;
    const px = nx => p + (nx / 100) * (W - p * 2);
    const py = ny => p + (ny / 100) * (H - p * 2);
    const done = Math.min(streak, c.days);
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 8, display: "block" }}>
            <rect width={W} height={H} fill="#020917" rx={8} />
            {c.lines.map(([a, b], i) => {
                const lit = a < done && b < done;
                return <line key={i} x1={px(c.stars[a].x)} y1={py(c.stars[a].y)} x2={px(c.stars[b].x)} y2={py(c.stars[b].y)}
                             stroke={lit ? "#c4d9f5" : "#0f1f35"} strokeWidth={lit ? 1.1 : 0.5} strokeOpacity={lit ? 0.65 : 0.25} />;
            })}
            {c.stars.map((s, i) => {
                const isDone = i < done;
                return <circle key={i} cx={px(s.x)} cy={py(s.y)} r={isDone ? 2.8 : 1.5}
                               fill={isDone ? "#f0f9ff" : "#1e3a5f"} fillOpacity={isDone ? 0.9 : 0.35} />;
            })}
        </svg>
    );
}

function WeeklyBar({ weeklyData }) {
    if (!weeklyData?.length) return null;
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 72 }}>
            {weeklyData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", borderRadius: 3, height: d.done ? 54 : 10, background: d.done ? "linear-gradient(180deg,#4ade80,#16a34a)" : "#0f1a2e", border: d.done ? "none" : "1px solid #1e293b", transition: "height 0.4s ease", boxShadow: d.done ? "0 0 6px rgba(74,222,128,0.3)" : "none" }} />
                    <div style={{ fontSize: 9, color: d.done ? "#4ade80" : "#334155", fontWeight: d.done ? 700 : 400 }}>{d.day.slice(0, 2)}</div>
                </div>
            ))}
        </div>
    );
}

function DonutRing({ pct, color, size = 72 }) {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0f1a2e" strokeWidth={5} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }} />
            <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={800} fill={color} fontFamily="'Syne',sans-serif">{Math.round(pct)}%</text>
        </svg>
    );
}

// ─── Single habit analytics card ──────────────────────────────────────────────
function HabitAnalyticsCard({ habitId, habitName }) {
    const [data, setData] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        apiFetch(`/api/logs/${habitId}/analytics`).then(d => {
            if (d) setData(d);
            setLoaded(true);  // always mark done, even on failure
        });
    }, [habitId]);

    if (!loaded) return (
        <div style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 18, padding: 20, minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 11, color: "#1e3a5f" }}>Loading…</div>
        </div>
    );

    if (!data) return (
        <div style={{ background: "#070f1e", border: "1px solid #1a2540", borderRadius: 18, padding: 20, minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div style={{ fontSize: 11, color: "#f87171" }}>Could not load data</div>
            <button onClick={() => { setLoaded(false); apiFetch(`/api/logs/${habitId}/analytics`).then(d => { if (d) setData(d); setLoaded(true); }); }}
                    style={{ fontSize: 10, color: "#6366f1", background: "transparent", border: "1px solid #6366f1", borderRadius: 5, padding: "3px 10px", cursor: "pointer" }}>Retry</button>
        </div>
    );

    const hasGoalConstellation = CONSTELLATIONS.find(x => x.name === data.constellation);

    return (
        <div style={{ background: "linear-gradient(145deg,#070f1e,#0a1628)", border: "1px solid #0f1a2e", borderRadius: 18, padding: "20px", animation: "fadeIn 0.4s ease" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{data.name}</div>
                    {data.description && <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>{data.description}</div>}
                </div>
                {data.constellation && (
                    <div style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 7, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: "#6366f1" }}>✦ {data.constellation}</div>
                )}
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 9, marginBottom: 16, flexWrap: "wrap" }}>
                <StatPill label="Current streak" value={`${data.currentStreak}d`} color={data.currentStreak > 0 ? "#f59e0b" : "#334155"} />
                <StatPill label="Best streak"    value={`${data.bestStreak}d`}    color="#6366f1" />
                <StatPill label="This week"      value={`${data.completedThisWeek}/7`} color="#4ade80" />
            </div>

            {/* Weekly bar + donut */}
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <DonutRing pct={data.weeklyPercentage} color="#4ade80" />
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>week</div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: "#334155", marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Last 7 days</div>
                    <WeeklyBar weeklyData={data.weeklyData} />
                </div>
            </div>

            {/* Constellation forming preview */}
            {data.constellation && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 9, color: "#334155", marginBottom: 7, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {data.constellation} — forming
                    </div>
                    <MiniConstellation constellationName={data.constellation} streak={data.currentStreak} />
                </div>
            )}

            {/* Progress to next milestone */}
            {data.nextMilestoneName && (
                <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginBottom: 4 }}>
                        <span>{data.constellation || "Start"} ({data.currentStreak}d)</span>
                        <span>{data.nextMilestoneName} ({data.nextMilestoneDays}d)</span>
                    </div>
                    <div style={{ height: 3, background: "#0f1a2e", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", borderRadius: 2,
                            width: `${Math.round((data.currentStreak / data.nextMilestoneDays) * 100)}%`,
                            background: "linear-gradient(90deg,#6366f1,#8b5cf6)", transition: "width 0.5s",
                        }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>
                        {data.nextMilestoneDays - data.currentStreak} more day{data.nextMilestoneDays - data.currentStreak !== 1 ? "s" : ""} to {data.nextMilestoneName}
                    </div>
                </div>
            )}
            {!data.nextMilestoneName && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#4ade80", fontWeight: 700 }}>🏆 All constellations formed!</div>
            )}
        </div>
    );
}

function StatPill({ label, value, color }) {
    return (
        <div style={{ background: "#040d1a", border: "1px solid #0f1a2e", borderRadius: 8, padding: "5px 11px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color, fontFamily: "'Syne',sans-serif" }}>{value}</div>
            <div style={{ fontSize: 9, color: "#334155" }}>{label}</div>
        </div>
    );
}

// ─── All Milestones reference grid ────────────────────────────────────────────
const MILESTONES = [
    { days: 3, name: "Triangulum" }, { days: 7, name: "Crux" },
    { days: 10, name: "Aries" }, { days: 14, name: "Lyra" },
    { days: 21, name: "Cassiopeia" }, { days: 30, name: "Orion" },
    { days: 45, name: "Scorpius" }, { days: 60, name: "Hercules" },
    { days: 90, name: "Perseus" }, { days: 120, name: "Andromeda" },
    { days: 150, name: "Ophiuchus" },
];

export default function Analytics() {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/habits").then(data => {
            if (Array.isArray(data)) setHabits(data);
            setLoading(false);
        });
    }, []);

    return (
        <>
            <style>{CSS}</style>
            <div style={{ minHeight: "100vh", background: "#020917", color: "#f1f5f9", fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 36px", borderBottom: "1px solid #070f1e", background: "rgba(2,9,23,0.96)", position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)" }}>
                    <div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800 }}>
                            <span style={{ color: "#f0f9ff", opacity: 0.4 }}>◈</span> Analytics
                        </div>
                        <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 1 }}>Your habit insights</div>
                    </div>
                    <button onClick={() => window.location.href = "/dashboard"} style={{ background: "#0f1a2e", border: "1px solid #1e293b", borderRadius: 9, padding: "7px 16px", color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>← Dashboard</button>
                </div>

                <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", color: "#1e3a5f", paddingTop: 80 }}>Loading analytics…</div>
                    ) : habits.length === 0 ? (
                        <div style={{ textAlign: "center", paddingTop: 80, color: "#1e3a5f" }}>No habits yet.</div>
                    ) : (
                        <>
                            <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
                                <div style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 10, padding: "11px 20px" }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#6366f1" }}>{habits.length}</div>
                                    <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>Total Habits</div>
                                </div>
                            </div>

                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Per Habit Breakdown</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px,1fr))", gap: 16 }}>
                                {habits.map(h => <HabitAnalyticsCard key={h.id} habitId={h.id} habitName={h.name} />)}
                            </div>

                            {/* Milestone reference */}
                            <div style={{ marginTop: 40 }}>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Constellation Milestones</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px,1fr))", gap: 9 }}>
                                    {MILESTONES.map(m => (
                                        <div key={m.name} style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 11, padding: "11px 13px" }}>
                                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{m.name}</div>
                                            <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, marginTop: 2 }}>{m.days} days</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}