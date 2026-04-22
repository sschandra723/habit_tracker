import React, { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:8080";
function getToken() { return localStorage.getItem("token"); }

const HABIT_CATEGORIES = [
    {
        label: "🏃 FITNESS & SPORTS",
        habits: [
            { name: "Running",      description: "Daily running session",          icon: "🏃" },
            { name: "Walking",      description: "30-minute walk",                 icon: "🚶" },
            { name: "Cycling",      description: "Cycling workout",                icon: "🚴" },
            { name: "Swimming",     description: "Swimming session",               icon: "🏊" },
            { name: "Gym Workout",  description: "Strength training at gym",       icon: "🏋️" },
            { name: "Yoga",         description: "Morning yoga practice",          icon: "🧘" },
            { name: "Tennis",       description: "Tennis practice",                icon: "🎾" },
            { name: "Badminton",    description: "Badminton session",              icon: "🏸" },
            { name: "Cricket",      description: "Cricket practice",               icon: "🏏" },
            { name: "Football",     description: "Football / Soccer session",      icon: "⚽" },
            { name: "Basketball",   description: "Basketball practice",            icon: "🏀" },
            { name: "Stretching",   description: "Full-body stretching",           icon: "🤸" },
        ],
    },
    {
        label: "🧠 MIND & LEARNING",
        habits: [
            { name: "Read a Book",       description: "Read for 20+ minutes",              icon: "📚" },
            { name: "Meditate",          description: "10-minute meditation",              icon: "🧘" },
            { name: "Journaling",        description: "Write in journal",                  icon: "📝" },
            { name: "Learn a Language",  description: "Language learning session",         icon: "🌍" },
            { name: "Practice Coding",   description: "Code for 30+ minutes",             icon: "💻" },
            { name: "Study",             description: "Dedicated study session",           icon: "📖" },
            { name: "Listen to Podcast", description: "Listen to an educational podcast",  icon: "🎧" },
            { name: "Take Online Course",description: "Complete a lesson online",          icon: "🎓" },
        ],
    },
    {
        label: "💧 HEALTH & WELLNESS",
        habits: [
            { name: "Drink Water",        description: "Drink 8 glasses of water",        icon: "💧" },
            { name: "Sleep 8 Hours",      description: "Get 8 hours of sleep",            icon: "😴" },
            { name: "No Junk Food",       description: "Avoid junk food today",           icon: "🥗" },
            { name: "Take Vitamins",      description: "Take daily vitamins",             icon: "💊" },
            { name: "No Phone Before Bed",description: "No screen 1hr before sleep",      icon: "📵" },
            { name: "Cold Shower",        description: "Take a cold shower",              icon: "🚿" },
            { name: "Skincare Routine",   description: "Complete skincare routine",       icon: "✨" },
        ],
    },
    {
        label: "🎨 CREATIVE & HOBBIES",
        habits: [
            { name: "Draw or Sketch",      description: "Creative drawing session",       icon: "🎨" },
            { name: "Play Music",          description: "Practice an instrument",         icon: "🎵" },
            { name: "Photography",         description: "Take photos today",              icon: "📷" },
            { name: "Cook a Healthy Meal", description: "Cook something nutritious",      icon: "🍳" },
            { name: "Gardening",           description: "Tend to your garden",            icon: "🌱" },
            { name: "Chess",               description: "Play or study chess",            icon: "♟️" },
        ],
    },
    {
        label: "🤝 SOCIAL & PRODUCTIVITY",
        habits: [
            { name: "No Social Media",      description: "Avoid social media today",           icon: "🚫" },
            { name: "Call Family / Friend", description: "Check in with someone you care about",icon: "📞" },
            { name: "Plan the Day",         description: "Write a to-do list",                icon: "📋" },
            { name: "Clean Room",           description: "Tidy up your space",                icon: "🧹" },
            { name: "Budget Review",        description: "Review your daily spending",         icon: "💰" },
            { name: "Gratitude Practice",   description: "Write 3 things you're grateful for", icon: "🙏" },
        ],
    },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #04080f; color: #f1f5f9; font-family: 'DM Sans', sans-serif; }

@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

/* ── Habit chip ── */
.hs-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid #1a2540; background: #060d1a;
  cursor: pointer; font-size: 13px; font-weight: 500;
  color: #94a3b8; transition: all 0.18s; user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px; /* touch target */
}
.hs-chip:hover  { border-color: #4ade80; color: #f1f5f9; background: rgba(74,222,128,0.05); }
.hs-chip:active { transform: scale(0.96); }
.hs-chip.sel    { border-color: #4ade80; background: rgba(74,222,128,0.1); color: #4ade80; font-weight: 600; }
.hs-chip .icon  { font-size: 16px; line-height: 1; flex-shrink: 0; }

/* ── Save button ── */
.hs-save {
  border: none; border-radius: 12px;
  font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800;
  transition: all 0.25s; cursor: pointer;
  min-height: 50px; padding: 0 32px;
  -webkit-tap-highlight-color: transparent;
}
.hs-save:active { transform: scale(0.97); }
.hs-save:disabled { cursor: not-allowed; }

/* ── Header ── */
.hs-header {
  padding: 24px 16px 0;
  max-width: 860px; margin: 0 auto;
}
@media(min-width: 640px) { .hs-header { padding: 28px 32px 0; } }

/* ── Categories wrapper ── */
.hs-body {
  max-width: 860px; margin: 0 auto;
  padding: 0 16px;
}
@media(min-width: 640px) { .hs-body { padding: 0 32px; } }

/* ── Title ── */
.hs-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(24px, 6vw, 34px);
  font-weight: 800; color: #f8fafc; line-height: 1.15; margin-bottom: 8px;
}

/* ── Fixed footer ── */
.hs-footer {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: rgba(4,8,15,0.97);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid #0a1120;
  padding: 14px 16px;
  display: flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 12px; z-index: 20;
}
@media(min-width: 640px) { .hs-footer { padding: 16px 32px; gap: 16px; } }

/* ── Category section ── */
.hs-cat { margin-bottom: 28px; animation: fadeIn 0.4s ease; }
.hs-cat-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
  color: #334155; margin-bottom: 11px; padding-bottom: 8px;
  border-bottom: 1px solid #0a1120; text-transform: uppercase;
}
.hs-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
}
`;

function getMode() {
    return new URLSearchParams(window.location.search).get("mode") || "signup";
}

export default function SelectHabits() {
    const [selected, setSelected]         = useState(new Set());
    const [saving, setSaving]             = useState(false);
    const [error, setError]               = useState("");
    const [existingNames, setExistingNames] = useState(new Set());
    const mode = getMode();

    useEffect(() => {
        if (mode === "add") {
            fetch(`${API}/api/habits`, {
                headers: { Authorization: "Bearer " + getToken() },
            }).then(r => r.json()).then(habits => {
                if (Array.isArray(habits))
                    setExistingNames(new Set(habits.map(h => h.name)));
            }).catch(() => {});
        }
    }, [mode]);

    const toggle = (name) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(name) ? next.delete(name) : next.add(name);
            return next;
        });
        setError("");
    };

    const allHabits = HABIT_CATEGORIES.flatMap(c => c.habits);

    const handleSave = async () => {
        if (selected.size === 0) {
            setError("Please select at least one habit.");
            return;
        }
        setSaving(true);
        const chosen = allHabits.filter(h => selected.has(h.name));
        try {
            await Promise.all(chosen.map(h =>
                fetch(`${API}/api/habits`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + getToken(),
                    },
                    body: JSON.stringify({ name: h.name, description: h.description }),
                })
            ));
            window.location.href = "/dashboard";
        } catch {
            setError("Something went wrong. Please try again.");
            setSaving(false);
        }
    };

    const pageTitle    = mode === "add" ? "Add more habits." : "Choose your habits.";
    const pageSubtitle = mode === "add"
        ? "Pick habits to add to your dashboard."
        : "Pick the habits you want to build. You can always add more later.";
    const saveLabel    = mode === "add"
        ? (saving ? "Adding…" : `Add ${selected.size || ""} Habit${selected.size !== 1 ? "s" : ""} →`)
        : (saving ? "Saving…" : "Save & Continue →");

    return (
        <>
            <style>{CSS}</style>
            <div style={{ minHeight: "100vh", background: "#04080f", paddingBottom: 100 }}>

                {/* Header */}
                <div className="hs-header">
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#4ade80", marginBottom: 20, display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", flexShrink: 0 }} />
                        HABITTRACKER
                    </div>
                    <h1 className="hs-title">{pageTitle}</h1>
                    <p style={{ fontSize: 14, color: "#475569", marginBottom: 28, lineHeight: 1.6 }}>{pageSubtitle}</p>
                </div>

                {/* Categories */}
                <div className="hs-body">
                    {HABIT_CATEGORIES.map(cat => {
                        const visibleHabits = mode === "add"
                            ? cat.habits.filter(h => !existingNames.has(h.name))
                            : cat.habits;
                        if (visibleHabits.length === 0) return null;
                        return (
                            <div key={cat.label} className="hs-cat">
                                <div className="hs-cat-label">{cat.label}</div>
                                <div className="hs-chips">
                                    {visibleHabits.map(habit => {
                                        const sel = selected.has(habit.name);
                                        return (
                                            <button
                                                key={habit.name}
                                                className={`hs-chip${sel ? " sel" : ""}`}
                                                onClick={() => toggle(habit.name)}
                                                title={habit.description}
                                            >
                                                <span className="icon">{habit.icon}</span>
                                                {habit.name}
                                                {sel && <span style={{ marginLeft: 2, fontSize: 10, fontWeight: 900 }}>✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Fixed footer */}
                <div className="hs-footer">
                    {error && (
                        <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600, textAlign: "center", width: "100%" }}>{error}</span>
                    )}
                    {selected.size > 0 && !error && (
                        <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>✦ {selected.size} selected</span>
                    )}
                    <button
                        className="hs-save"
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: selected.size > 0 ? "#4ade80" : "#1e293b",
                            color:      selected.size > 0 ? "#04080f" : "#475569",
                            boxShadow:  selected.size > 0 ? "0 8px 24px rgba(74,222,128,0.25)" : "none",
                        }}
                    >
                        {saveLabel}
                    </button>
                    {mode === "signup" && (
                        <button onClick={() => window.location.href = "/dashboard"} style={{ fontSize: 13, color: "#334155", background: "none", border: "none", cursor: "pointer", padding: "8px 4px" }}>
                            Skip for now
                        </button>
                    )}
                    {mode === "add" && (
                        <button onClick={() => window.location.href = "/dashboard"} style={{ fontSize: 13, color: "#334155", background: "none", border: "none", cursor: "pointer", padding: "8px 4px" }}>
                            ← Back
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}