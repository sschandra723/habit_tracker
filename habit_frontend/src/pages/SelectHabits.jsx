import React, { useState } from "react";

const API = "http://localhost:8080";

function getToken() { return localStorage.getItem("token"); }

const HABIT_CATEGORIES = [
    {
        label: "🏃 Fitness & Sports",
        habits: [
            { name: "Running", description: "Daily running session", icon: "🏃" },
            { name: "Walking", description: "30-minute walk", icon: "🚶" },
            { name: "Cycling", description: "Cycling workout", icon: "🚴" },
            { name: "Swimming", description: "Swimming session", icon: "🏊" },
            { name: "Gym Workout", description: "Strength training at gym", icon: "🏋️" },
            { name: "Yoga", description: "Morning yoga practice", icon: "🧘" },
            { name: "Tennis", description: "Tennis practice", icon: "🎾" },
            { name: "Badminton", description: "Badminton session", icon: "🏸" },
            { name: "Cricket", description: "Cricket practice", icon: "🏏" },
            { name: "Football", description: "Football / Soccer session", icon: "⚽" },
            { name: "Basketball", description: "Basketball practice", icon: "🏀" },
            { name: "Stretching", description: "Full-body stretching", icon: "🤸" },
        ],
    },
    {
        label: "🧠 Mind & Learning",
        habits: [
            { name: "Read a Book", description: "Read for 20+ minutes", icon: "📚" },
            { name: "Meditate", description: "10-minute meditation", icon: "🧠" },
            { name: "Journaling", description: "Write in journal", icon: "📝" },
            { name: "Learn a Language", description: "Language learning session", icon: "🌍" },
            { name: "Practice Coding", description: "Code for 30+ minutes", icon: "💻" },
            { name: "Study", description: "Dedicated study session", icon: "📖" },
            { name: "Listen to Podcast", description: "Listen to an educational podcast", icon: "🎧" },
            { name: "Take Online Course", description: "Complete a lesson online", icon: "🎓" },
        ],
    },
    {
        label: "💧 Health & Wellness",
        habits: [
            { name: "Drink Water", description: "Drink 8 glasses of water", icon: "💧" },
            { name: "Sleep 8 Hours", description: "Get 8 hours of sleep", icon: "😴" },
            { name: "No Junk Food", description: "Avoid junk food today", icon: "🥗" },
            { name: "Take Vitamins", description: "Take daily vitamins", icon: "💊" },
            { name: "No Phone Before Bed", description: "No screen time 1hr before sleep", icon: "📵" },
            { name: "Cold Shower", description: "Take a cold shower", icon: "🚿" },
            { name: "Skincare Routine", description: "Complete skincare routine", icon: "✨" },
        ],
    },
    {
        label: "🎨 Creative & Hobbies",
        habits: [
            { name: "Draw or Sketch", description: "Creative drawing session", icon: "🎨" },
            { name: "Play Music", description: "Practice an instrument", icon: "🎵" },
            { name: "Photography", description: "Take photos today", icon: "📷" },
            { name: "Cook a Healthy Meal", description: "Cook something nutritious", icon: "🍳" },
            { name: "Gardening", description: "Tend to your garden", icon: "🌱" },
            { name: "Chess", description: "Play or study chess", icon: "♟️" },
        ],
    },
    {
        label: "🤝 Social & Productivity",
        habits: [
            { name: "No Social Media", description: "Avoid social media today", icon: "🚫" },
            { name: "Call Family / Friend", description: "Check in with someone you care about", icon: "📞" },
            { name: "Plan the Day", description: "Write a to-do list for the day", icon: "📋" },
            { name: "Clean Room", description: "Tidy up your space", icon: "🧹" },
            { name: "Budget Review", description: "Review your daily spending", icon: "💰" },
            { name: "Gratitude Practice", description: "Write 3 things you're grateful for", icon: "🙏" },
        ],
    },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .hs-root {
    min-height: 100vh;
    background: #04080f;
    font-family: 'DM Sans', sans-serif;
    color: #f1f5f9;
    padding-bottom: 120px;
  }

  .hs-header {
    padding: 32px 40px 0;
    max-width: 860px;
    margin: 0 auto;
  }

  .hs-logo {
    font-family: 'Syne', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #4ade80;
    margin-bottom: 28px;
    display: flex; align-items: center; gap: 8px;
  }

  .hs-logo-dot { width:7px; height:7px; border-radius:50%; background:#4ade80; box-shadow:0 0 8px #4ade80; }

  .hs-title {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .hs-subtitle {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 10px;
  }

  .hs-counter {
    font-size: 13px;
    color: #4ade80;
    font-weight: 600;
    margin-bottom: 32px;
  }

  .hs-body { max-width: 860px; margin: 0 auto; padding: 0 40px; }

  .hs-category { margin-bottom: 32px; }

  .hs-cat-label {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #475569;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid #0f172a;
  }

  .hs-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hs-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1.5px solid #1e293b;
    background: #0a1120;
    cursor: pointer;
    transition: all 0.18s;
    user-select: none;
    font-size: 14px;
    font-weight: 500;
    color: #94a3b8;
  }

  .hs-chip:hover {
    border-color: #4ade80;
    color: #f1f5f9;
    background: rgba(74,222,128,0.05);
    transform: translateY(-1px);
  }

  .hs-chip.selected {
    border-color: #4ade80;
    background: rgba(74,222,128,0.12);
    color: #4ade80;
    font-weight: 600;
  }

  .hs-chip-icon { font-size: 17px; line-height: 1; }

  .hs-chip-check {
    width: 16px; height: 16px;
    border-radius: 50%;
    background: #4ade80;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
    color: #04080f;
    font-weight: 900;
    margin-left: 2px;
  }

  .hs-footer {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: rgba(4,8,15,0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid #0f172a;
    padding: 18px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 20;
  }

  .hs-save-btn {
    padding: 14px 56px;
    background: #4ade80;
    color: #04080f;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.03em;
  }

  .hs-save-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,222,128,0.25); }
  .hs-save-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  .hs-skip-btn {
    font-size: 13px;
    color: #475569;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    text-decoration: underline;
  }

  .hs-skip-btn:hover { color: #94a3b8; }

  .hs-warn {
    font-size: 13px;
    color: #f87171;
    font-weight: 500;
  }
`;

export default function SelectHabits() {
    const [selected, setSelected] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

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
        if (selected.size === 0) { setError("Please select at least one habit to continue."); return; }
        setSaving(true);
        const token = localStorage.getItem("token");
        const chosen = allHabits.filter(h => selected.has(h.name));
        try {
            await Promise.all(chosen.map(h =>
                fetch(`${API}/api/habits`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token,
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

    const handleSkip = () => { window.location.href = "/dashboard"; };

    return (
        <>
            <style>{css}</style>
            <div className="hs-root">
                <div className="hs-header">
                    <div className="hs-logo"><div className="hs-logo-dot" /> HabitTracker</div>
                    <h1 className="hs-title">Choose your habits.</h1>
                    <p className="hs-subtitle">Pick the habits you want to build. You can always add more later.</p>
                    {selected.size > 0 && (
                        <div className="hs-counter">✦ {selected.size} habit{selected.size > 1 ? "s" : ""} selected</div>
                    )}
                </div>

                <div className="hs-body">
                    {HABIT_CATEGORIES.map(cat => (
                        <div key={cat.label} className="hs-category">
                            <div className="hs-cat-label">{cat.label}</div>
                            <div className="hs-grid">
                                {cat.habits.map(habit => {
                                    const sel = selected.has(habit.name);
                                    return (
                                        <button
                                            key={habit.name}
                                            className={`hs-chip ${sel ? "selected" : ""}`}
                                            onClick={() => toggle(habit.name)}
                                            title={habit.description}
                                        >
                                            <span className="hs-chip-icon">{habit.icon}</span>
                                            {habit.name}
                                            {sel && <span className="hs-chip-check">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fixed footer */}
                <div className="hs-footer">
                    {error && <span className="hs-warn">{error}</span>}
                    <button className="hs-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : `Save & Continue →`}
                    </button>
                    <button className="hs-skip-btn" onClick={handleSkip}>Skip for now</button>
                </div>
            </div>
        </>
    );
}