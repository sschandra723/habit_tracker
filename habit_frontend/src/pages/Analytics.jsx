import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080";
function getToken() { return localStorage.getItem("token"); }

async function apiFetch(path) {
    const res = await fetch(API + path, {
        headers: { Authorization: "Bearer " + getToken() },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
`;

// ─── Simple bar chart (no library needed) ─────────────────────────────────────
function WeeklyBar({ days }) {
    if (!days || !days.length) return null;
    const max = 1; // binary done/not done
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {days.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                        width: "100%", borderRadius: 4,
                        height: d.done ? 60 : 12,
                        background: d.done
                            ? "linear-gradient(180deg,#4ade80,#16a34a)"
                            : "#0f1a2e",
                        border: d.done ? "none" : "1px solid #1e293b",
                        transition: "height 0.4s ease",
                        boxShadow: d.done ? "0 0 8px rgba(74,222,128,0.3)" : "none",
                    }} />
                    <div style={{ fontSize: 10, color: d.done ? "#4ade80" : "#334155", fontWeight: d.done ? 700 : 400 }}>
                        {d.day.slice(0, 2)}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Donut progress ring ──────────────────────────────────────────────────────
function DonutRing({ pct, color, size = 80, label }) {
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div style={{ textAlign: "center" }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke="#0f1a2e" strokeWidth={6} />
                <circle cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke={color} strokeWidth={6}
                        strokeDasharray={`${dash} ${circ}`}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
                <text x={size / 2} y={size / 2 + 4} textAnchor="middle"
                      fontSize={13} fontWeight={800} fill={color} fontFamily="'Syne',sans-serif">
                    {Math.round(pct)}%
                </text>
            </svg>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{label}</div>
        </div>
    );
}

// ─── Habit analytics card ─────────────────────────────────────────────────────
function HabitAnalyticsCard({ habit }) {
    const [streak, setStreak]   = useState(null);
    const [weekly, setWeekly]   = useState(null);
    const [longest, setLongest] = useState(0);
    const [weekData, setWeekData] = useState([]);

    useEffect(() => {
        Promise.all([
            apiFetch(`/api/logs/${habit.id}/streak`),
            apiFetch(`/api/logs/${habit.id}/weekly`),
            apiFetch(`/api/logs/${habit.id}/longest-streak`),
            apiFetch(`/api/logs/${habit.id}/weekly-data`),
        ]).then(([s, w, lng, wd]) => {
            if (s)   setStreak(s);
            if (w)   setWeekly(w);
            if (lng) setLongest(lng.Streak || 0);
            if (wd && Array.isArray(wd)) setWeekData(wd);
        });
    }, [habit.id]);

    const weeklyPct = weekly ? Math.round((weekly.completedDays / 7) * 100) : 0;
    const currentStreak = streak?.streak || 0;
    const constellation = streak?.constellation;

    return (
        <div style={{
            background: "linear-gradient(145deg,#070f1e,#0a1628)",
            border: "1px solid #0f1a2e",
            borderRadius: 18, padding: "20px",
            animation: "fadeIn 0.4s ease",
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{habit.name}</div>
                    {habit.description && <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>{habit.description}</div>}
                </div>
                {constellation && (
                    <div style={{
                        background: "linear-gradient(135deg,#f59e0b22,#6366f122)",
                        border: "1px solid #f59e0b44",
                        borderRadius: 8, padding: "3px 10px",
                        fontSize: 10, fontWeight: 700, color: "#f59e0b",
                    }}>✦ {constellation}</div>
                )}
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <StatPill label="Current streak" value={`${currentStreak}d`} color={currentStreak > 0 ? "#f59e0b" : "#334155"} />
                <StatPill label="Best streak" value={`${longest}d`} color="#6366f1" />
                <StatPill label="This week" value={`${weekly?.completedDays || 0}/7`} color="#4ade80" />
            </div>

            {/* Weekly completion ring + bar */}
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <DonutRing pct={weeklyPct} color="#4ade80" size={72} label="week" />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#334155", marginBottom: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Last 7 days</div>
                    <WeeklyBar days={weekData} />
                </div>
            </div>

            {/* Streak constellation progress */}
            {currentStreak > 0 && (
                <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, color: "#334155", marginBottom: 6, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Constellation progress</div>
                    <ConstellationProgress streak={currentStreak} />
                </div>
            )}
        </div>
    );
}

function StatPill({ label, value, color }) {
    return (
        <div style={{ background: "#040d1a", border: "1px solid #0f1a2e", borderRadius: 8, padding: "6px 12px" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'Syne',sans-serif" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#334155" }}>{label}</div>
        </div>
    );
}

// Shows which constellation you're in and how far to next
const MILESTONES = [
    { days: 3, name: "Triangulum" },
    { days: 7, name: "Crux" },
    { days: 10, name: "Aries" },
    { days: 14, name: "Lyra" },
    { days: 21, name: "Cassiopeia" },
    { days: 30, name: "Orion" },
    { days: 45, name: "Scorpius" },
    { days: 60, name: "Hercules" },
    { days: 90, name: "Perseus" },
    { days: 120, name: "Andromeda" },
    { days: 150, name: "Ophiuchus" },
];

function ConstellationProgress({ streak }) {
    const current = MILESTONES.filter(m => streak >= m.days).pop();
    const next = MILESTONES.find(m => streak < m.days);
    if (!next) return <div style={{ fontSize: 11, color: "#4ade80" }}>🏆 Max constellation reached!</div>;

    const prev = current ? current.days : 0;
    const pct = ((streak - prev) / (next.days - prev)) * 100;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginBottom: 4 }}>
                <span>{current ? current.name : "Start"} ({streak}d)</span>
                <span>{next.name} ({next.days}d)</span>
            </div>
            <div style={{ height: 4, background: "#0f1a2e", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                    height: "100%", borderRadius: 2, width: `${pct}%`,
                    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                    transition: "width 0.5s ease",
                }} />
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>
                {next.days - streak} more day{next.days - streak !== 1 ? "s" : ""} to unlock {next.name}
            </div>
        </div>
    );
}

// ─── Analytics Dashboard ──────────────────────────────────────────────────────
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
                {/* Header */}
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
                    {/* Summary row */}
                    {!loading && habits.length > 0 && (
                        <div style={{ display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap" }}>
                            <SummaryCard label="Total Habits" value={habits.length} color="#6366f1" />
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", color: "#1e3a5f", paddingTop: 80 }}>Loading analytics…</div>
                    ) : habits.length === 0 ? (
                        <div style={{ textAlign: "center", paddingTop: 80, color: "#1e3a5f" }}>No habits yet. Add some in the dashboard.</div>
                    ) : (
                        <>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>Per Habit Breakdown</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 18 }}>
                                {habits.map(h => <HabitAnalyticsCard key={h.id} habit={h} />)}
                            </div>

                            {/* Constellation guide */}
                            <div style={{ marginTop: 40 }}>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>Constellation Milestones</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
                                    {MILESTONES.map(m => (
                                        <div key={m.name} style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 12, padding: "12px 14px" }}>
                                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{m.name}</div>
                                            <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, marginTop: 2 }}>{m.days} days</div>
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

function SummaryCard({ label, value, color }) {
    return (
        <div style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 11, padding: "13px 22px" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{label}</div>
        </div>
    );
}