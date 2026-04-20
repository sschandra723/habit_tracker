import React, { useEffect, useState, useCallback, useRef } from "react";
import { CONSTELLATIONS } from "./constellations";

const API = process.env.REACT_APP_API_URL ;
function getToken() { return localStorage.getItem("token"); }
function getTodayKey(habitId) { return `marked_${habitId}_${new Date().toISOString().split("T")[0]}`; }
function wasMarkedToday(habitId) { return localStorage.getItem(getTodayKey(habitId)) === "1"; }
function persistMarkToday(habitId) { localStorage.setItem(getTodayKey(habitId), "1"); }
function getGoalKey(habitId) { return `habit_goal_${habitId}`; }
function getStoredGoal(habitId) { return localStorage.getItem(getGoalKey(habitId)); }
function setStoredGoal(habitId, n) { n ? localStorage.setItem(getGoalKey(habitId), n) : localStorage.removeItem(getGoalKey(habitId)); }

async function apiFetch(path, options = {}) {
    const res = await fetch(API + path, { ...options, headers: { Authorization: "Bearer " + getToken(), ...(options.headers || {}) } });
    if (res.status === 401 || res.status === 403) { localStorage.removeItem("token"); window.location.href = "/"; return null; }
    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes celebrate{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes popIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
`;

function ConstellationHoverMap({ constellation, streak }) {
    const [hIdx, setHIdx] = useState(null);
    if (!constellation) return null;
    const W = 320, H = 185, pad = 13;
    const px = nx => pad + (nx / 100) * (W - pad * 2);
    const py = ny => pad + (ny / 100) * (H - pad * 2);
    const { stars, lines, days } = constellation;
    const completedDays = Math.min(streak, days);
    return (
        <div style={{ position: "relative" }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", borderRadius: 10 }}>
                <defs>
                    <radialGradient id="hmapbg" cx="50%" cy="50%" r="70%"><stop offset="0%" stopColor="#0d1b35" /><stop offset="100%" stopColor="#020917" /></radialGradient>
                    <filter id="hmglow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <rect width={W} height={H} fill="url(#hmapbg)" rx={10} />
                {Array.from({ length: 16 }).map((_, i) => <circle key={`a${i}`} cx={(((i * 137.5) % 100) / 100) * W} cy={(((i * 97.3) % 100) / 100) * H} r={0.5} fill="#f0f9ff" fillOpacity={0.06} />)}
                {lines.map(([a, b], i) => { const lit = a < completedDays && b < completedDays; return <line key={i} x1={px(stars[a].x)} y1={py(stars[a].y)} x2={px(stars[b].x)} y2={py(stars[b].y)} stroke={lit ? "#c4d9f5" : "#0f1f35"} strokeWidth={lit ? 1.2 : 0.5} strokeOpacity={lit ? 0.6 : 0.2} />; })}
                {stars.map((s, i) => {
                    const done = i < completedDays, next = i === completedDays, hov = hIdx === i, r = done ? 4.2 : next ? 2.8 : 1.8;
                    return (<g key={i} onMouseEnter={() => setHIdx(i)} onMouseLeave={() => setHIdx(null)} style={{ cursor: "default" }}>
                        <circle cx={px(s.x)} cy={py(s.y)} r={14} fill="transparent" />
                        {!done && <circle cx={px(s.x)} cy={py(s.y)} r={1.8} fill="#1e3a5f" fillOpacity={next ? 0.8 : 0.35} />}
                        {done && <circle cx={px(s.x)} cy={py(s.y)} r={hov ? 12 : 7} fill="#f0f9ff" fillOpacity={hov ? 0.13 : 0.05} />}
                        {next && <circle cx={px(s.x)} cy={py(s.y)} r={7} fill="none" stroke="#60a5fa" strokeWidth={1} strokeOpacity={0.55} strokeDasharray="2 2" />}
                        {done && <circle cx={px(s.x)} cy={py(s.y)} r={hov ? r + 1.5 : r} fill="#f0f9ff" filter="url(#hmglow)" style={{ transition: "all 0.15s" }} />}
                    </g>);
                })}
                <text x={W - 7} y={H - 5} textAnchor="end" fontSize={9} fill="#1e3a5f" fontFamily="monospace">{completedDays}/{days}d · {Math.round((completedDays / days) * 100)}%</text>
            </svg>
            {hIdx !== null && <div style={{ position: "absolute", top: 4, left: `${Math.min(Math.max((stars[hIdx].x / 100) * W, 60), W - 60)}px`, transform: "translateX(-50%)", background: "rgba(4,13,26,0.97)", border: "1px solid #1e3a5f", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20 }}>
                Day {hIdx + 1}
                {hIdx < completedDays ? <span style={{ color: "#4ade80", marginLeft: 5 }}>✓ done</span> : hIdx === completedDays ? <span style={{ color: "#60a5fa", marginLeft: 5 }}>← next</span> : <span style={{ color: "#334155", marginLeft: 5 }}>locked</span>}
            </div>}
        </div>
    );
}

function GoalPicker({ onSelect, onClose, currentGoal }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,9,23,0.94)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(10px)" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#070f1e", border: "1px solid #1e293b", borderRadius: 22, padding: "28px 24px", maxWidth: 700, width: "92vw", maxHeight: "88vh", overflowY: "auto", animation: "celebrate 0.3s ease" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 21, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>Choose your constellation goal</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 22 }}>See the full shape before committing. Stars light up one by one as your streak grows.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 13 }}>
                    {CONSTELLATIONS.map(c => {
                        const W = 175, H = 95, p = 9;
                        const px = nx => p + (nx / 100) * (W - p * 2);
                        const py = ny => p + (ny / 100) * (H - p * 2);
                        const isCur = currentGoal === c.name;
                        return (
                            <button key={c.name} onClick={() => onSelect(c.name)} style={{ background: isCur ? "rgba(99,102,241,0.12)" : "#040d1a", border: `1.5px solid ${isCur ? "#6366f1" : "#1a2540"}`, borderRadius: 15, padding: "13px 12px 11px", cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}
                                    onMouseEnter={e => { if (!isCur) { e.currentTarget.style.borderColor = "#4ade80"; e.currentTarget.style.background = "#070f1e"; }}}
                                    onMouseLeave={e => { if (!isCur) { e.currentTarget.style.borderColor = "#1a2540"; e.currentTarget.style.background = "#040d1a"; }}}>
                                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 8, display: "block" }}>
                                    <rect width={W} height={H} fill="#020917" rx={8} />
                                    {c.lines.map(([a, b], i) => <line key={i} x1={px(c.stars[a].x)} y1={py(c.stars[a].y)} x2={px(c.stars[b].x)} y2={py(c.stars[b].y)} stroke="#1e3a5f" strokeWidth={0.8} strokeOpacity={0.7} />)}
                                    {c.stars.map((s, i) => <circle key={i} cx={px(s.x)} cy={py(s.y)} r={2} fill="#f0f9ff" fillOpacity={0.5} />)}
                                </svg>
                                <div style={{ marginTop: 9 }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{c.name}</div>
                                    <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, marginTop: 2 }}>{c.days} day streak</div>
                                    <div style={{ fontSize: 10, color: "#334155", marginTop: 3, lineHeight: 1.4 }}>{c.myth.slice(0, 58)}…</div>
                                </div>
                                {isCur && <div style={{ marginTop: 7, fontSize: 10, color: "#6366f1", fontWeight: 700 }}>✓ Current goal</div>}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} style={{ marginTop: 20, padding: "8px 22px", background: "#1e293b", border: "none", borderRadius: 9, color: "#94a3b8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            </div>
        </div>
    );
}

function ConstellationPopup({ goalConstellation, streak, onChangeGoal }) {
    const pct = goalConstellation ? Math.min(streak / goalConstellation.days, 1) : 0;
    return (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", zIndex: 60, minWidth: 345, filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.9))", animation: "popIn 0.2s ease", pointerEvents: "auto" }}>
            <div style={{ width: 10, height: 10, background: "#040d1a", border: "1px solid #1e3a5f", borderBottom: "none", borderRight: "none", transform: "rotate(45deg)", margin: "0 auto -6px" }} />
            <div style={{ background: "#040d1a", border: "1px solid #1e3a5f", borderRadius: 15, padding: "14px 14px 11px" }}>
                {goalConstellation ? (<>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div><span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#f1f5f9" }}>{goalConstellation.name}</span><span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600, marginLeft: 8 }}>{goalConstellation.days}d goal</span><span style={{ fontSize: 11, color: "#6366f1", marginLeft: 6 }}>day {streak}</span></div>
                        <button onClick={e => { e.stopPropagation(); onChangeGoal(); }} style={{ fontSize: 10, color: "#475569", background: "#0a1628", border: "1px solid #1e293b", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>change</button>
                    </div>
                    <div style={{ height: 3, background: "#0f1a2e", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: `${pct * 100}%`, background: pct >= 1 ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#6366f1,#8b5cf6)", transition: "width 0.6s" }} />
                    </div>
                    <ConstellationHoverMap constellation={goalConstellation} streak={streak} />
                    <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 7, fontStyle: "italic", lineHeight: 1.4 }}>"{goalConstellation.myth}"</div>
                    {pct >= 1 && <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "#4ade80", fontWeight: 700 }}>🏆 Complete! Choose your next goal →</div>}
                </>) : (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontFamily: "'Syne',sans-serif" }}>Choose your constellation goal</div>
                        <div style={{ fontSize: 12, color: "#475569", marginBottom: 14 }}>Pick a target. See stars connect as your streak grows.</div>
                        <button onClick={e => { e.stopPropagation(); onChangeGoal(); }} style={{ padding: "9px 22px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 9, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Pick a Constellation →</button>
                    </div>
                )}
            </div>
        </div>
    );
}

function HabitCalendar({ habit, calendar, onClose }) {
    const today = new Date();
    const year = today.getFullYear(), month = today.getMonth();
    const calSet = new Set(Array.isArray(calendar) ? calendar : []);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = today.toLocaleString("default", { month: "long" });
    const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const key = d => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const doneDays = cells.filter(d => d && calSet.has(key(d))).length;
    const missedDays = Math.max(0, today.getDate() - doneDays);
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,9,23,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(8px)" }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#070f1e", border: "1px solid #1e293b", borderRadius: 20, padding: "22px 22px 18px", minWidth: 306, animation: "celebrate 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div><div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: "#f1f5f9" }}>{habit.name}</div><div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{monthName} {year}</div></div>
                    <button onClick={onClose} style={{ background: "#1e293b", border: "none", borderRadius: 6, padding: "3px 9px", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 12, marginBottom: 9 }}>
                    {[["#15803d","Done"],["#0a1120","Missed"],["#6366f1","Today"]].map(([c,l]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#64748b" }}><div style={{ width: 9, height: 9, borderRadius: 2, background: l === "Today" ? "transparent" : c, border: l === "Today" ? `1.5px solid ${c}` : "none" }} /> {l}</div>
                    ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 3 }}>
                    {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#334155", fontWeight: 600 }}>{d}</div>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
                    {cells.map((day, i) => {
                        if (!day) return <div key={i} />;
                        const isToday = day === today.getDate(), done = calSet.has(key(day)), isFuture = day > today.getDate(), missed = !done && !isToday && !isFuture;
                        return <div key={i} style={{ aspectRatio: "1", borderRadius: 4, background: done ? "#15803d" : missed ? "#0a1120" : "transparent", border: isToday ? "1.5px solid #6366f1" : done ? "1.5px solid #22c55e" : "1.5px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: done ? 700 : 400, color: done ? "#dcfce7" : isFuture ? "#1e293b" : missed ? "#1e3a5f" : "#475569", position: "relative" }}>
                            {day}{done && <span style={{ position: "absolute", top: 0, right: 1, fontSize: 5, color: "#4ade80" }}>✓</span>}
                        </div>;
                    })}
                </div>
                <div style={{ marginTop: 12, padding: "9px 12px", background: "#040d1a", borderRadius: 9, display: "flex", gap: 22 }}>
                    {[["#4ade80","done",doneDays],["#f87171","missed",missedDays],["#64748b","left",daysInMonth-today.getDate()]].map(([c,l,v]) => (
                        <div key={l}><div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: "'Syne',sans-serif" }}>{v}</div><div style={{ fontSize: 9, color: "#334155" }}>{l}</div></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Celebration({ constellation, onDismiss }) {
    useEffect(() => { const t = setTimeout(onDismiss, 8000); return () => clearTimeout(t); }, [onDismiss]);
    const W = 330, H = 195, pad = 14;
    const px = nx => pad + (nx / 100) * (W - pad * 2);
    const py = ny => pad + (ny / 100) * (H - pad * 2);
    const { stars, lines, name, days, myth } = constellation;
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2,9,23,0.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
            <div style={{ animation: "float 3s ease infinite", textAlign: "center" }}>
                <div style={{ fontSize: 54, marginBottom: 12 }}>✨</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 27, fontWeight: 800, color: "#f1f5f9", marginBottom: 8 }}>You formed {name}!</div>
                <div style={{ fontSize: 13, color: "#64748b", maxWidth: 350, lineHeight: 1.7, marginBottom: 5 }}>{myth}</div>
                <div style={{ fontSize: 13, color: "#4ade80", fontWeight: 700, marginBottom: 24 }}>{days} days of consistency 🔥</div>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 14 }}>
                    <defs><radialGradient id="cb8" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0d1b35" /><stop offset="100%" stopColor="#020917" /></radialGradient><filter id="gl8"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                    <rect width={W} height={H} fill="url(#cb8)" rx={14} />
                    {lines.map(([a,b],i) => <line key={i} x1={px(stars[a].x)} y1={py(stars[a].y)} x2={px(stars[b].x)} y2={py(stars[b].y)} stroke="#c7d9f5" strokeWidth={1.1} strokeOpacity={0.6} />)}
                    {stars.map((s,i) => <g key={i}><circle cx={px(s.x)} cy={py(s.y)} r={8} fill="#f0f9ff" fillOpacity={0.06} /><circle cx={px(s.x)} cy={py(s.y)} r={4} fill="#f0f9ff" filter="url(#gl8)" /></g>)}
                </svg>
            </div>
            <button onClick={onDismiss} style={{ marginTop: 26, padding: "12px 38px", background: "#4ade80", color: "#04080f", border: "none", borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>Choose Next Target →</button>
        </div>
    );
}

function ProfileDropdown({ onLogout }) {
    const [open,setOpen]=useState(false); const [user,setUser]=useState(null);
    const [editing,setEditing]=useState(false); const [newName,setNewName]=useState("");
    const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
    const ref=useRef();
    useEffect(()=>{apiFetch("/api/users/me").then(d=>{if(d){setUser(d);setNewName(d.name||"");}});},[]);
    useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setEditing(false);}};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
    const saveName=async()=>{if(!newName.trim())return;setSaving(true);const u=await apiFetch("/api/users/me",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newName.trim()})});if(u){setUser(u);setMsg("Saved! ✓");setTimeout(()=>setMsg(""),2000);}setEditing(false);setSaving(false);};
    const initials=user?.name?user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2):"?";
    return (
        <div ref={ref} style={{position:"relative"}}>
            <button onClick={()=>setOpen(o=>!o)} style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"2px solid rgba(255,255,255,0.1)",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{initials}</button>
            {open&&<div style={{position:"absolute",right:0,top:"calc(100% + 10px)",background:"#0a1628",border:"1px solid #1e293b",borderRadius:16,minWidth:240,padding:8,boxShadow:"0 16px 40px rgba(0,0,0,0.7)",zIndex:100}}>
                <div style={{padding:"11px 12px 12px",borderBottom:"1px solid #1e293b",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:editing?10:0}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0}}>{initials}</div>
                        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:13,color:"#f1f5f9",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name||"—"}</div><div style={{fontSize:11,color:"#475569",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email||"—"}</div></div>
                    </div>
                    {editing?(<div style={{display:"flex",flexDirection:"column",gap:7}}>
                        <input value={newName} onChange={e=>setNewName(e.target.value)} style={{...INP,fontSize:12,padding:"6px 9px"}} placeholder="Your name" autoFocus/>
                        <div style={{display:"flex",gap:7}}><button onClick={saveName} disabled={saving} style={{...SMB("#4ade80","#04080f"),padding:"5px 12px",fontSize:11}}>{saving?"…":"Save"}</button><button onClick={()=>setEditing(false)} style={{...SMB("#1e293b","#94a3b8"),padding:"5px 12px",fontSize:11}}>Cancel</button></div>
                        {msg&&<div style={{fontSize:10,color:"#4ade80"}}>{msg}</div>}
                    </div>):(<button onClick={()=>setEditing(true)} style={{marginTop:7,width:"100%",padding:"5px 9px",background:"#0f172a",border:"1px solid #1e293b",borderRadius:7,color:"#6366f1",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"left"}}>✎ Edit name</button>)}
                </div>
                <button onClick={()=>window.location.href="/analytics"} onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{width:"100%",padding:"8px 12px",background:"transparent",border:"none",borderRadius:7,color:"#6366f1",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}}>◈ Analytics</button>
                <button onClick={onLogout} onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{width:"100%",padding:"8px 12px",background:"transparent",border:"none",borderRadius:7,color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left"}}>↩ Logout</button>
            </div>}
        </div>
    );
}

function HabitCard({ habit, onDelete, onUpdate, onCelebrate }) {
    const [marked,setMarked] = useState(() => wasMarkedToday(habit.id));
    const [streak,setStreak] = useState(0);
    const [longest,setLongest] = useState(0);
    const [weekly,setWeekly] = useState(0);
    const [calendar,setCalendar] = useState([]);
    const [loading,setLoading] = useState(false);
    const [editing,setEditing] = useState(false);
    const [editName,setEditName] = useState(habit.name);
    const [editDesc,setEditDesc] = useState(habit.description||"");
    const [showCal,setShowCal] = useState(false);
    const [showPopup,setShowPopup] = useState(false);
    const [showGoalPicker,setShowGoalPicker] = useState(false);
    const [goalName,setGoalName] = useState(() => getStoredGoal(habit.id));
    const cardRef = useRef();
    const prevStreakRef = useRef(null);
    const goalConstellation = goalName ? CONSTELLATIONS.find(x => x.name === goalName) : null;

    const loadStats = useCallback(async () => {
        const [s, lng, w, cal] = await Promise.all([
            apiFetch(`/api/logs/${habit.id}/streak`),
            apiFetch(`/api/logs/${habit.id}/longest-streak`),
            apiFetch(`/api/logs/${habit.id}/weekly`),
            apiFetch(`/api/logs/${habit.id}/calendar`),
        ]);
        if (s) {
            const newStreak = s.streak || 0;
            if (goalConstellation && prevStreakRef.current !== null && prevStreakRef.current < goalConstellation.days && newStreak >= goalConstellation.days) onCelebrate(goalConstellation);
            prevStreakRef.current = newStreak;
            setStreak(newStreak);
        }
        if (lng) setLongest(lng.Streak || 0);
        if (w) setWeekly(w.completedDays || 0);
        if (Array.isArray(cal)) {
            setCalendar(cal);
            const today = new Date().toISOString().split("T")[0];
            if (cal.includes(today)) persistMarkToday(habit.id);
            setMarked(wasMarkedToday(habit.id));
        }
    }, [habit.id, goalConstellation, onCelebrate]);

    useEffect(() => { loadStats(); }, [loadStats]);
    useEffect(() => {
        if (!showPopup) return;
        const h = e => { if (cardRef.current && !cardRef.current.contains(e.target)) setShowPopup(false); };
        document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
    }, [showPopup]);

    const handleMark = async () => {
        if (marked) return;
        setLoading(true);
        await apiFetch(`/api/logs/${habit.id}/mark`, { method: "POST" });
        persistMarkToday(habit.id); setMarked(true);
        await loadStats(); setLoading(false);
    };
    const saveEdit = async () => {
        const u = await apiFetch(`/api/habits/${habit.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, description: editDesc }) });
        if (u) { onUpdate(u); setEditing(false); }
    };
    const handleDelete = async () => {
        if (!window.confirm(`Delete "${habit.name}"?`)) return;
        await apiFetch(`/api/habits/${habit.id}`, { method: "DELETE" }); onDelete(habit.id);
    };
    const handleGoalSelect = name => { setGoalName(name); setStoredGoal(habit.id, name); setShowGoalPicker(false); };

    return (<>
        {showCal && <HabitCalendar habit={habit} calendar={calendar} onClose={() => setShowCal(false)} />}
        {showGoalPicker && <GoalPicker currentGoal={goalName} onSelect={handleGoalSelect} onClose={() => setShowGoalPicker(false)} />}
        <div ref={cardRef} style={{ position: "relative", background: "linear-gradient(160deg,#070f1e,#0a1628)", border: marked ? "1.5px solid rgba(240,249,255,0.2)" : "1.5px solid #0f1a2e", borderRadius: 20, padding: "18px", display: "flex", flexDirection: "column", gap: 12, boxShadow: marked ? "0 0 22px rgba(240,249,255,0.04)" : "none", animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                {editing ? (
                    <div style={{ flex: 1, marginRight: 8, display: "flex", flexDirection: "column", gap: 7 }}>
                        <input value={editName} onChange={e => setEditName(e.target.value)} style={INP} placeholder="Habit name" />
                        <input value={editDesc} onChange={e => setEditDesc(e.target.value)} style={INP} placeholder="Description" />
                        <div style={{ display: "flex", gap: 7 }}><button onClick={saveEdit} style={SMB("#4ade80","#04080f")}>Save</button><button onClick={() => setEditing(false)} style={SMB("#1e293b","#94a3b8")}>Cancel</button></div>
                    </div>
                ) : (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9", marginBottom: 1 }}>{habit.name}</div>
                        {habit.description && <div style={{ fontSize: 11, color: "#334155" }}>{habit.description}</div>}
                    </div>
                )}
                {!editing && <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => setShowCal(true)} style={ICN("#0f172a","#475569")}>📅</button>
                    <button onClick={() => setEditing(true)} style={ICN("#0f172a")}>✎</button>
                    <button onClick={handleDelete} style={ICN("#0f172a","#f87171")}>✕</button>
                </div>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                <span style={{ background: streak > 0 ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "#0f172a", color: streak > 0 ? "#fff" : "#334155", borderRadius: 999, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{streak >= 7 ? "🔥" : streak >= 3 ? "⚡" : "✦"} {streak}d streak</span>
                {longest > 0 && <span style={{ fontSize: 10, color: "#475569", background: "#0a1120", borderRadius: 999, padding: "2px 8px" }}>Best: {longest}d</span>}
                <div style={{ display: "flex", gap: 2 }}>{Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ width: 6, height: 14, borderRadius: 2, background: i < weekly ? "#f0f9ff" : "#0f1a2e" }} />)}</div>
            </div>
            <div style={{ position: "relative" }}>
                <div onClick={() => setShowPopup(p => !p)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "#040d1a", borderRadius: 8, border: `1px solid ${showPopup ? "#1e3a5f" : "#0f1a2e"}`, cursor: "pointer" }}>
                    <span style={{ fontSize: 11 }}>
                        {goalName ? <><span style={{ color: "#6366f1", fontWeight: 600 }}>✦ {goalName}</span><span style={{ color: "#1e3a5f" }}> · click to see stars forming</span></> : <span style={{ color: "#334155", fontWeight: 600 }}>✦ Set your constellation goal</span>}
                    </span>
                    <span style={{ fontSize: 9, color: showPopup ? "#6366f1" : "#334155" }}>{showPopup ? "▲" : "▼"}</span>
                </div>
                {showPopup && <ConstellationPopup goalConstellation={goalConstellation} streak={streak} onChangeGoal={() => { setShowPopup(false); setShowGoalPicker(true); }} />}
            </div>
            <button onClick={handleMark} disabled={marked || loading} style={{ padding: "9px 0", borderRadius: 9, border: "none", cursor: marked ? "default" : "pointer", fontWeight: 700, fontSize: 13, background: marked ? "linear-gradient(90deg,#f0f9ff,#e2e8f0)" : "linear-gradient(90deg,#0f1a2e,#1a2b42)", color: marked ? "#04080f" : "#475569", transition: "all 0.3s", opacity: loading ? 0.6 : 1 }}>
                {loading ? "…" : marked ? "✦ Shining Today ✓" : "Mark as Done"}
            </button>
            <button onClick={handleMark} disabled={marked || loading} style={{ padding: "8px 0", borderRadius: 9, border: marked ? "1.5px solid #22c55e" : "1.5px dashed #1e3a5f", background: "transparent", cursor: marked ? "default" : "pointer", fontWeight: 600, fontSize: 12, color: marked ? "#22c55e" : "#1e3a5f", transition: "all 0.2s", opacity: marked ? 0.7 : 1 }}>
                {marked ? "✓ Streak Saved" : "🔥 Save Streak"}
            </button>
        </div>
    </>);
}

export default function Dashboard() {
    const [habits, setHabits]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [celebration, setCelebration] = useState(null);
    useEffect(() => {
        if (!getToken()) { window.location.href = "/"; return; }
        apiFetch("/api/habits").then(data => { if (Array.isArray(data)) setHabits(data); setLoading(false); });
    }, []);
    const handleCelebrate = useCallback(c => setCelebration(c), []);
    const handleLogout    = () => { localStorage.removeItem("token"); window.location.href = "/"; };
    // eslint-disable-next-line no-unused-vars
    const handleAdd    = h  => setHabits(p => [...p, h]);
    const handleDelete = id => setHabits(p => p.filter(h => h.id !== id));
    const handleUpdate = u  => setHabits(p => p.map(h => h.id === u.id ? u : h));
    return (<>
        <style>{CSS}</style>
        {celebration && <Celebration constellation={celebration} onDismiss={() => setCelebration(null)} />}
        <div style={{ minHeight: "100vh", background: "#020917", color: "#f1f5f9", fontFamily: "'DM Sans',sans-serif", paddingBottom: 60 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid #070f1e", background: "rgba(2,9,23,0.96)", position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)" }}>
                <div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800 }}><span style={{ color: "#f0f9ff", opacity: 0.4 }}>✦</span> HabitTracker</div><div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 1 }}>Map your stars · build your constellation</div></div>
                <ProfileDropdown onLogout={handleLogout} />
            </div>
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 16px" }}>
                {habits.length > 0 && <div style={{ marginBottom: 20 }}><div style={{ background: "#070f1e", border: "1px solid #0f1a2e", borderRadius: 10, padding: "12px 20px", display: "inline-block" }}><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#6366f1" }}>{habits.length}</div><div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>Total Habits</div></div></div>}
                <div style={{ marginBottom: 24 }}><button onClick={() => window.location.href = "/select-habits?mode=add"} style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Syne',sans-serif", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>+ New Habit</button></div>
                {loading ? <div style={{ textAlign: "center", color: "#1e3a5f", paddingTop: 70 }}>Mapping the stars…</div>
                    : habits.length === 0 ? <div style={{ textAlign: "center", paddingTop: 70 }}><div style={{ fontSize: 48, marginBottom: 12 }}>✦</div><div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: "#1e3a5f" }}>No habits yet</div><div style={{ fontSize: 12, color: "#0f1a2e", marginTop: 4 }}>Click "+ New Habit" to start</div></div>
                        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 18 }}>{habits.map(h => <HabitCard key={h.id} habit={h} onDelete={handleDelete} onUpdate={handleUpdate} onCelebrate={handleCelebrate} />)}</div>}
            </div>
        </div>
    </>);
}

const INP = { background: "#040d1a", border: "1px solid #0f1a2e", borderRadius: 7, padding: "8px 10px", color: "#f1f5f9", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
const SMB = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 7, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer" });
const ICN = (bg, color = "#334155") => ({ background: bg, color, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" });