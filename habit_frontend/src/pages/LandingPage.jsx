import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   LandingPage.jsx
   Route: "/"  (shown only to non-authenticated users — see App.js)
   Design: dark space theme matching the rest of the app
───────────────────────────────────────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #020917;
  --bg2:      #070f1e;
  --bg3:      #0a1628;
  --border:   #0f1a2e;
  --border2:  #1e293b;
  --accent:   #4ade80;
  --purple:   #6366f1;
  --purple2:  #8b5cf6;
  --text:     #f1f5f9;
  --muted:    #475569;
  --dim:      #334155;
}

html { scroll-behavior: smooth; }

body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

/* ── Animations ── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes twinkle  { 0%,100%{opacity:0.2} 50%{opacity:1} }
@keyframes orbit    { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }

.fade-up { animation: fadeUp 0.7s ease both; }
.fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
.fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
.fade-up-3 { animation: fadeUp 0.7s 0.35s ease both; }
.fade-up-4 { animation: fadeUp 0.7s 0.5s ease both; }

/* ── Navigation ── */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 48px;
  background: rgba(2,9,23,0.85); backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: padding 0.3s;
}
.lp-nav-logo {
  font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800;
  color: var(--text); display: flex; align-items: center; gap: 8px; text-decoration: none;
}
.lp-nav-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.lp-nav-links { display: flex; align-items: center; gap: 10px; }

/* ── Buttons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 26px; border-radius: 10px; border: none; cursor: pointer;
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  background: linear-gradient(90deg, var(--purple), var(--purple2));
  color: #fff; box-shadow: 0 4px 18px rgba(99,102,241,0.35);
  transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
  text-decoration: none;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,0.45); }
.btn-primary:active { transform: scale(0.97); }

.btn-secondary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 26px; border-radius: 10px; border: 1px solid var(--border2); cursor: pointer;
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  background: transparent; color: var(--muted);
  transition: all 0.18s; text-decoration: none;
}
.btn-secondary:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-1px); }
.btn-secondary:active { transform: scale(0.97); }

.btn-ghost {
  padding: 9px 18px; border-radius: 9px; border: 1px solid var(--border2); cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  background: transparent; color: var(--muted);
  transition: all 0.15s; text-decoration: none; display: inline-flex; align-items: center;
}
.btn-ghost:hover { background: var(--bg2); color: var(--text); }

/* ── Hero ── */
.lp-hero {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  padding: 120px 24px 80px; position: relative; overflow: hidden;
}
.lp-hero-badge {
  display: inline-flex; align-items: center; gap: 7px; margin-bottom: 24px;
  padding: 5px 14px; border-radius: 999px;
  background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
  font-size: 12px; font-weight: 600; color: var(--accent); letter-spacing: 0.05em;
}
.lp-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 1.8s ease infinite; }
.lp-hero-title {
  font-family: 'Syne', sans-serif; font-size: clamp(38px, 7vw, 76px);
  font-weight: 800; line-height: 1.08; letter-spacing: -0.03em;
  color: var(--text); max-width: 820px; margin-bottom: 20px;
}
.lp-hero-title span { background: linear-gradient(135deg, var(--accent), #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.lp-hero-subtitle {
  font-size: clamp(15px, 2vw, 18px); color: var(--muted);
  max-width: 540px; line-height: 1.7; margin-bottom: 40px;
}
.lp-hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px; }
.lp-hero-stats { display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; }
.lp-stat { text-align: center; }
.lp-stat-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--text); }
.lp-stat-label { font-size: 11px; color: var(--dim); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.08em; }
.lp-stat-divider { width: 1px; background: var(--border); align-self: stretch; }

/* ── Orbs ── */
.orb {
  position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0;
}

/* ── Section ── */
.lp-section { padding: 96px 24px; max-width: 1100px; margin: 0 auto; }
.lp-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--purple); margin-bottom: 12px;
}
.lp-section-title {
  font-family: 'Syne', sans-serif; font-size: clamp(26px, 4vw, 40px);
  font-weight: 800; color: var(--text); max-width: 560px; line-height: 1.15; margin-bottom: 16px;
}
.lp-section-sub { font-size: 15px; color: var(--muted); max-width: 480px; line-height: 1.7; margin-bottom: 52px; }

/* ── Feature cards ── */
.lp-features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 16px; }
.lp-feat-card {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 18px;
  padding: 26px; transition: border-color 0.2s, transform 0.2s;
}
.lp-feat-card:hover { border-color: var(--border2); transform: translateY(-3px); }
.lp-feat-icon {
  width: 44px; height: 44px; border-radius: 12px; margin-bottom: 16px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.lp-feat-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.lp-feat-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

/* ── Steps ── */
.lp-steps { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); gap: 20px; }
.lp-step {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 18px;
  padding: 28px 24px; position: relative; overflow: hidden; transition: border-color 0.2s;
}
.lp-step:hover { border-color: rgba(99,102,241,0.35); }
.lp-step-num {
  font-family: 'Syne', sans-serif; font-size: 64px; font-weight: 800;
  color: rgba(99,102,241,0.08); position: absolute; top: 8px; right: 16px; line-height: 1; pointer-events: none;
}
.lp-step-icon { font-size: 26px; margin-bottom: 14px; }
.lp-step-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.lp-step-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }

/* ── Constellation highlight ── */
.lp-const-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
@media(max-width:720px){ .lp-const-wrap{grid-template-columns:1fr;} }
.lp-const-cards { display: flex; flex-direction: column; gap: 12px; }
.lp-const-card {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px;
  display: flex; align-items: center; gap: 16px; transition: border-color 0.2s, transform 0.2s;
  cursor: default;
}
.lp-const-card:hover { border-color: rgba(99,102,241,0.3); transform: translateX(4px); }
.lp-const-card-icon { font-size: 22px; flex-shrink: 0; }
.lp-const-card-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: var(--text); }
.lp-const-card-days { font-size: 11px; color: var(--accent); font-weight: 600; margin-top: 2px; }

/* ── Preview cards ── */
.lp-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 18px; }
.lp-preview-card {
  background: linear-gradient(145deg, var(--bg2), var(--bg3));
  border: 1px solid var(--border); border-radius: 20px; padding: 20px;
  animation: fadeUp 0.6s ease both;
}
.lp-preview-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 4px; }
.lp-preview-card-sub { font-size: 11px; color: var(--dim); margin-bottom: 14px; }
.lp-preview-bar-wrap { display: flex; gap: 4px; align-items: flex-end; height: 48px; }
.lp-preview-bar { border-radius: 3px; flex: 1; transition: height 0.4s; }

/* ── CTA section ── */
.lp-cta-section {
  text-align: center; padding: 96px 24px 80px; position: relative;
  border-top: 1px solid var(--border);
}
.lp-cta-title { font-family: 'Syne', sans-serif; font-size: clamp(28px, 5vw, 50px); font-weight: 800; color: var(--text); max-width: 600px; margin: 0 auto 16px; line-height: 1.12; }
.lp-cta-sub { font-size: 16px; color: var(--muted); max-width: 420px; margin: 0 auto 36px; line-height: 1.65; }

/* ── Footer ── */
.lp-footer {
  border-top: 1px solid var(--border); padding: 28px 48px;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.lp-footer-logo { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--dim); display: flex; align-items: center; gap: 7px; }
.lp-footer-copy { font-size: 12px; color: var(--dim); }

/* ── Full-width divider ── */
.lp-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

/* ── Responsive ── */
@media(max-width:640px){
  .lp-nav { padding: 14px 20px; }
  .lp-hero { padding: 100px 16px 60px; }
  .lp-section { padding: 64px 16px; }
  .lp-footer { flex-direction: column; text-align: center; padding: 22px 16px; }
}
`;

/* ── Tiny star SVG constellation (decorative) ── */
function StarMap() {
    const stars = [
        {x:20,y:30},{x:45,y:10},{x:70,y:40},{x:55,y:65},{x:80,y:75},
        {x:30,y:70},{x:10,y:55},{x:60,y:20},{x:85,y:35},{x:40,y:85},
    ];
    const lines = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,7],[7,8],[2,8]];
    return (
        <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", opacity:0.7 }}>
            {lines.map(([a,b],i) => (
                <line key={i} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y}
                      stroke="#c4d9f5" strokeWidth={0.6} strokeOpacity={0.4} />
            ))}
            {stars.map((s,i) => (
                <circle key={i} cx={s.x} cy={s.y} r={i===0||i===4?2:1.3}
                        fill="#f0f9ff" fillOpacity={i===0||i===4?0.9:0.55}
                        style={{ animation:`twinkle ${1.5+i*0.3}s ease infinite`, animationDelay:`${i*0.2}s` }} />
            ))}
        </svg>
    );
}

/* ── Sample habit preview card ── */
function PreviewHabitCard({ name, streak, weekly, color }) {
    return (
        <div className="lp-preview-card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                    <div className="lp-preview-card-title">{name}</div>
                    <div className="lp-preview-card-sub">Daily habit</div>
                </div>
                <span style={{ background: streak > 0 ? "linear-gradient(135deg,#f59e0b,#ef4444)":"#0f172a", color: streak > 0 ? "#fff":"#334155", borderRadius:999, padding:"2px 9px", fontSize:11, fontWeight:700 }}>
                    {streak >= 7 ? "🔥" : "⚡"} {streak}d streak
                </span>
            </div>
            <div className="lp-preview-bar-wrap">
                {weekly.map((h, i) => (
                    <div key={i} className="lp-preview-bar" style={{ height: h > 0 ? h : 6, background: h > 0 ? `linear-gradient(180deg,${color},${color}88)` : "#0f1a2e", border: h > 0 ? "none":"1px solid #1e293b" }} />
                ))}
            </div>
            <div style={{ display:"flex", gap:3, marginTop:10 }}>
                {["M","T","W","T","F","S","S"].map((d,i) => (
                    <div key={i} style={{ flex:1, textAlign:"center", fontSize:8, color: weekly[i] > 0 ? color:"#334155", fontWeight:600 }}>{d}</div>
                ))}
            </div>
            <div style={{ marginTop:12, padding:"7px 0 0", borderTop:"1px solid #0f1a2e", display:"flex", gap:8 }}>
                <div style={{ fontSize:11, color:"#6366f1", fontWeight:600 }}>✦ Orion</div>
                <div style={{ fontSize:11, color:"#334155" }}>· 30d goal</div>
            </div>
        </div>
    );
}

/* ── Main Landing Page ── */
export default function LandingPage() {
    const heroRef = useRef();

    // Parallax on hero orbs
    useEffect(() => {
        const move = (e) => {
            if (!heroRef.current) return;
            const { clientX, clientY } = e;
            const { innerWidth: W, innerHeight: H } = window;
            const x = (clientX / W - 0.5) * 20;
            const y = (clientY / H - 0.5) * 20;
            const orbs = heroRef.current.querySelectorAll(".orb");
            orbs[0] && (orbs[0].style.transform = `translate(${x * 0.8}px, ${y * 0.8}px)`);
            orbs[1] && (orbs[1].style.transform = `translate(${-x * 0.6}px, ${-y * 0.6}px)`);
            orbs[2] && (orbs[2].style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`);
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    const features = [
        { icon:"📅", bg:"rgba(99,102,241,0.12)", color:"#6366f1", title:"Daily Habit Tracking", desc:"Log habits with a single tap. See your progress in a clean, beautiful dashboard that keeps you focused." },
        { icon:"🔥", bg:"rgba(239,68,68,0.12)",  color:"#f87171", title:"Streak System",         desc:"Build momentum day by day. Your streaks are visualised clearly so you never lose track of your progress." },
        { icon:"◈",  bg:"rgba(74,222,128,0.12)", color:"#4ade80", title:"Analytics Dashboard",   desc:"Understand your patterns. Weekly charts, completion rates, and trend data — all at a glance." },
        { icon:"✦",  bg:"rgba(251,191,36,0.12)", color:"#fbbf24", title:"Milestone Rewards",      desc:"Reach streak milestones and unlock constellation rewards. Gamification that actually motivates you." },
    ];

    const steps = [
        { icon:"✏️", title:"Create your habits", desc:"Name your habit, add a description, and set a constellation goal to work towards." },
        { icon:"☑️", title:"Track daily progress",desc:"Mark habits complete each day. The calendar view shows your full history at a glance." },
        { icon:"🔥", title:"Build your streak",   desc:"Keep your streak alive every day. The longer the streak, the more stars you light up." },
        { icon:"🏆", title:"Unlock milestones",   desc:"Hit 3, 7, 14, 30, 60, 90+ day milestones to form beautiful constellation patterns." },
    ];

    const constellations = [
        { name:"Triangulum", days:3,   emoji:"△" },
        { name:"Crux",       days:7,   emoji:"✚" },
        { name:"Lyra",       days:14,  emoji:"◇" },
        { name:"Orion",      days:30,  emoji:"⬡" },
        { name:"Perseus",    days:90,  emoji:"✦" },
        { name:"Andromeda",  days:120, emoji:"☽" },
    ];

    const previewData = [
        { name:"Morning Run",    streak:12, weekly:[38,0,40,38,42,0,44], color:"#4ade80" },
        { name:"Read 30 mins",   streak:7,  weekly:[30,30,0,30,28,30,0], color:"#60a5fa" },
        { name:"Drink 2L Water", streak:21, weekly:[44,42,40,44,42,38,44], color:"#f59e0b" },
    ];

    return (
        <>
            <style>{CSS}</style>

            {/* ── Navigation ── */}
            <nav className="lp-nav">
                <a href="/" className="lp-nav-logo">
                    <div className="lp-nav-dot" />
                    HabitTracker
                </a>
                <div className="lp-nav-links">
                    <a href="#features" className="btn-ghost">Features</a>
                    <a href="#how" className="btn-ghost">How it works</a>
                    <a href="/auth" className="btn-ghost">Login</a>
                    <a href="/auth?tab=signup" className="btn-primary" style={{ padding:"9px 20px", fontSize:13 }}>Get Started</a>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="lp-hero" ref={heroRef}>
                {/* Background orbs */}
                <div className="orb" style={{ width:600, height:600, background:"rgba(99,102,241,0.07)", top:-150, left:-100 }} />
                <div className="orb" style={{ width:400, height:400, background:"rgba(74,222,128,0.06)", bottom:-80, right:-60 }} />
                <div className="orb" style={{ width:300, height:300, background:"rgba(96,165,250,0.05)", top:"40%", right:"15%" }} />

                {/* Tiny twinkling stars */}
                {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} style={{
                        position:"absolute", borderRadius:"50%", background:"#f0f9ff",
                        width: Math.random() > 0.7 ? 2 : 1.5, height: Math.random() > 0.7 ? 2 : 1.5,
                        top: `${(i * 37.3 + 13) % 95}%`, left: `${(i * 61.7 + 7) % 97}%`,
                        opacity: 0.15 + (i % 5) * 0.08,
                        animation: `twinkle ${2 + (i % 4)}s ease infinite`,
                        animationDelay: `${(i % 6) * 0.4}s`,
                        zIndex: 0, pointerEvents:"none",
                    }} />
                ))}

                <div style={{ position:"relative", zIndex:1 }}>
                    <div className="lp-hero-badge fade-up">
                        <div className="lp-hero-badge-dot" />
                        Build habits that stick
                    </div>

                    <h1 className="lp-hero-title fade-up-1">
                        Turn your habits into<br />
                        <span>constellations</span>
                    </h1>

                    <p className="lp-hero-subtitle fade-up-2">
                        Track daily habits, build powerful streaks, and unlock
                        beautiful constellation milestones. A habit tracker that
                        actually keeps you motivated.
                    </p>

                    <div className="lp-hero-cta fade-up-3">
                        <a href="/auth?tab=signup" className="btn-primary" style={{ fontSize:15, padding:"13px 30px" }}>
                            ✦ Get Started — Free
                        </a>
                        <a href="/auth" className="btn-secondary" style={{ fontSize:15, padding:"13px 30px" }}>
                            Login →
                        </a>
                    </div>

                    <div className="lp-hero-stats fade-up-4">
                        <div className="lp-stat">
                            <div className="lp-stat-num">11</div>
                            <div className="lp-stat-label">Constellations</div>
                        </div>
                        <div className="lp-stat-divider" />
                        <div className="lp-stat">
                            <div className="lp-stat-num">150+</div>
                            <div className="lp-stat-label">Day Milestone</div>
                        </div>
                        <div className="lp-stat-divider" />
                        <div className="lp-stat">
                            <div className="lp-stat-num">∞</div>
                            <div className="lp-stat-label">Habits to Track</div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="lp-divider" />

            {/* ── Features ── */}
            <section id="features" style={{ padding:"96px 24px", background:"var(--bg)" }}>
                <div style={{ maxWidth:1100, margin:"0 auto" }}>
                    <div className="lp-section-label">Features</div>
                    <div className="lp-section-title">Everything you need to build better habits</div>
                    <div className="lp-section-sub">No fluff. No noise. Just the tools that actually make you consistent.</div>
                    <div className="lp-features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="lp-feat-card" style={{ animationDelay:`${i*0.1}s` }}>
                                <div className="lp-feat-icon" style={{ background: f.bg }}>
                                    <span style={{ color: f.color }}>{f.icon}</span>
                                </div>
                                <div className="lp-feat-title">{f.title}</div>
                                <div className="lp-feat-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="lp-divider" />

            {/* ── How It Works ── */}
            <section id="how" style={{ padding:"96px 24px", background:"var(--bg)" }}>
                <div style={{ maxWidth:1100, margin:"0 auto" }}>
                    <div className="lp-section-label">How It Works</div>
                    <div className="lp-section-title">From habit to constellation in 4 steps</div>
                    <div className="lp-section-sub">Simple enough to start today. Powerful enough to keep you going for months.</div>
                    <div className="lp-steps">
                        {steps.map((s, i) => (
                            <div key={i} className="lp-step">
                                <div className="lp-step-num">{String(i+1).padStart(2,"0")}</div>
                                <div className="lp-step-icon">{s.icon}</div>
                                <div className="lp-step-title">{s.title}</div>
                                <div className="lp-step-desc">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="lp-divider" />

            {/* ── Constellation highlight ── */}
            <section style={{ padding:"96px 24px", background:"var(--bg)" }}>
                <div style={{ maxWidth:1100, margin:"0 auto" }}>
                    <div className="lp-const-wrap">
                        <div>
                            <div className="lp-section-label">Unique Feature</div>
                            <div className="lp-section-title">Habits that form constellations</div>
                            <p style={{ fontSize:14, color:"var(--muted)", lineHeight:1.75, marginBottom:28, maxWidth:420 }}>
                                Every milestone you hit — 3 days, 7 days, 30, 90, 150 — lights up a new
                                star in your constellation. Watch it form as your streak grows.
                                It's not just tracking. It's a map of your consistency.
                            </p>
                            <a href="/auth?tab=signup" className="btn-primary">Start forming your constellation →</a>
                        </div>
                        <div>
                            {/* Star map visual */}
                            <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:20, padding:24, marginBottom:16, height:200, position:"relative", overflow:"hidden" }}>
                                <div style={{ position:"absolute", inset:0, padding:24 }}><StarMap /></div>
                                <div style={{ position:"absolute", bottom:14, right:16, fontSize:10, color:"var(--dim)", fontFamily:"monospace" }}>Orion · 30d · 100%</div>
                                <div style={{ position:"absolute", top:14, left:16, fontSize:11, color:"var(--accent)", fontWeight:700 }}>✦ Complete</div>
                            </div>
                            <div className="lp-const-cards">
                                {constellations.map((c, i) => (
                                    <div key={i} className="lp-const-card">
                                        <div className="lp-const-card-icon" style={{ color: i < 3 ? "#4ade80" : "#6366f1" }}>{c.emoji}</div>
                                        <div>
                                            <div className="lp-const-card-name">{c.name}</div>
                                            <div className="lp-const-card-days">{c.days} day streak</div>
                                        </div>
                                        {i < 3 && <div style={{ marginLeft:"auto", fontSize:10, color:"#4ade80", fontWeight:700, background:"rgba(74,222,128,0.1)", borderRadius:6, padding:"2px 8px" }}>Unlocked</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="lp-divider" />

            {/* ── Preview / Dashboard preview ── */}
            <section style={{ padding:"96px 24px", background:"var(--bg)" }}>
                <div style={{ maxWidth:1100, margin:"0 auto" }}>
                    <div className="lp-section-label">Preview</div>
                    <div className="lp-section-title">Your dashboard, at a glance</div>
                    <div className="lp-section-sub">See exactly what your habit tracking looks like from day one.</div>
                    <div className="lp-preview-grid">
                        {previewData.map((h, i) => <PreviewHabitCard key={i} {...h} />)}
                    </div>
                    <div style={{ marginTop:28, padding:"20px 24px", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                        <div>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:4 }}>Ready to start your own?</div>
                            <div style={{ fontSize:12, color:"var(--muted)" }}>Free to use. No credit card needed.</div>
                        </div>
                        <a href="/auth?tab=signup" className="btn-primary">Create my dashboard →</a>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <div className="lp-cta-section">
                <div className="orb" style={{ width:500, height:500, background:"rgba(99,102,241,0.06)", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }} />
                <div style={{ position:"relative", zIndex:1 }}>
                    <div className="lp-section-label" style={{ textAlign:"center", marginBottom:16 }}>Get started today</div>
                    <h2 className="lp-cta-title">Your streak starts<br />tonight</h2>
                    <p className="lp-cta-sub">Join for free. Pick your first habit. Mark it done. Watch a star light up.</p>
                    <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
                        <a href="/auth?tab=signup" className="btn-primary" style={{ fontSize:15, padding:"14px 32px" }}>✦ Start for free</a>
                        <a href="/auth" className="btn-secondary" style={{ fontSize:15, padding:"14px 32px" }}>I already have an account</a>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer-logo">
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80" }} />
                    HabitTracker
                </div>
                <div className="lp-footer-copy">Built with ☕ · Map your stars, build your constellation</div>
            </footer>
        </>
    );
}