import React, { useEffect, useState, useCallback, useRef } from "react";
import { CONSTELLATIONS } from "./constellations";
import { apiFetch, showToast } from "./apiFetch";
import Toast from "./Toast";
import "./keepalive";

// ─── localStorage helpers ──────────────────────────────────────────────────────
function getTodayKey(id)      { return `marked_${id}_${new Date().toISOString().split("T")[0]}`; }
function wasMarkedToday(id)   { return localStorage.getItem(getTodayKey(id)) === "1"; }
function persistMarkToday(id) { localStorage.setItem(getTodayKey(id), "1"); }
function getStoredGoal(id)    { return localStorage.getItem(`habit_goal_${id}`); }
function setStoredGoal(id, n) { n ? localStorage.setItem(`habit_goal_${id}`, n) : localStorage.removeItem(`habit_goal_${id}`); }

// ─── Global CSS (mobile-first) ────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #020917;
  --bg2:     #070f1e;
  --bg3:     #0a1628;
  --border:  #0f1a2e;
  --border2: #1e293b;
  --text:    #f1f5f9;
  --muted:   #475569;
  --dim:     #334155;
  --accent:  #4ade80;
  --purple:  #6366f1;
  --purple2: #8b5cf6;
  --amber:   #f59e0b;
  --red:     #f87171;
}

html { font-size: 16px; }
body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

@keyframes fadeIn    { from{opacity:0;transform:translateY(6px)}   to{opacity:1;transform:translateY(0)} }
@keyframes celebrate { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes popIn     { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
@keyframes markPop   { 0%{transform:scale(1)} 40%{transform:scale(1.06)} 100%{transform:scale(1)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

/* ── Nav ── */
.db-nav {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; border-bottom:1px solid var(--border);
  background:rgba(2,9,23,0.96); position:sticky; top:0; z-index:40;
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
}
@media(min-width:640px){ .db-nav{padding:16px 32px;} }

/* ── Main grid ── */
.db-main { max-width:1100px; margin:0 auto; padding:20px 14px 80px; }
@media(min-width:640px){ .db-main{padding:28px 20px 80px;} }
@media(min-width:1024px){ .db-main{padding:32px 24px 80px;} }

.db-habit-grid {
  display:grid;
  grid-template-columns:1fr;
  gap:14px;
}
@media(min-width:520px)  { .db-habit-grid{grid-template-columns:repeat(2,1fr);} }
@media(min-width:900px)  { .db-habit-grid{grid-template-columns:repeat(3,1fr); gap:18px;} }
@media(min-width:1100px) { .db-habit-grid{grid-template-columns:repeat(3,1fr);} }

/* ── Habit card ── */
.habit-card {
  background:linear-gradient(160deg,var(--bg2),var(--bg3));
  border-radius:18px; padding:16px;
  display:flex; flex-direction:column; gap:11px;
  animation:fadeIn 0.3s ease; transition:box-shadow 0.3s, border-color 0.3s;
  border:1.5px solid var(--border);
  position:relative;
}
@media(min-width:640px){ .habit-card{padding:18px; border-radius:20px;} }
.habit-card.marked { border-color:rgba(240,249,255,0.18); box-shadow:0 0 22px rgba(240,249,255,0.04); }

/* ── Buttons ── */
.btn-mark {
  padding:10px 0; border-radius:9px; border:none; width:100%;
  font-weight:700; font-size:13px; cursor:pointer; outline:none;
  transition:all 0.25s ease;
}
.btn-mark:not(:disabled):hover  { transform:translateY(-1px); box-shadow:0 4px 16px rgba(99,102,241,0.25); }
.btn-mark:not(:disabled):active { transform:scale(0.97); }
.btn-mark:disabled               { cursor:default; }
.btn-mark.done                   { animation:markPop 0.35s ease; }
/* Bigger tap target on mobile */
@media(max-width:639px){ .btn-mark{padding:13px 0; font-size:14px;} }

.btn-streak {
  padding:8px 0; border-radius:9px; background:transparent; width:100%;
  font-weight:600; font-size:12px; cursor:pointer; outline:none; transition:all 0.2s ease;
}
.btn-streak:not(:disabled):hover { transform:translateY(-1px); }
.btn-streak:not(:disabled):active{ transform:scale(0.97); }
@media(max-width:639px){ .btn-streak{padding:11px 0;} }

.btn-nav {
  display:inline-flex; align-items:center; gap:6px;
  padding:10px 22px; border-radius:10px; border:none; cursor:pointer;
  font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
  background:linear-gradient(90deg,var(--purple),var(--purple2));
  color:#fff; box-shadow:0 4px 14px rgba(99,102,241,0.3);
  transition:transform 0.18s, box-shadow 0.18s; white-space:nowrap;
}
.btn-nav:hover  { transform:translateY(-2px); box-shadow:0 6px 20px rgba(99,102,241,0.4); }
.btn-nav:active { transform:scale(0.97); }
@media(max-width:639px){ .btn-nav{padding:10px 16px; font-size:12px;} }

.btn-sm {
  border:none; border-radius:7px; padding:6px 12px;
  font-weight:600; font-size:12px; cursor:pointer; transition:all 0.15s;
}
.btn-sm:hover  { opacity:0.88; transform:translateY(-1px); }
.btn-sm:active { transform:scale(0.97); }
.btn-sm:disabled { opacity:0.5; cursor:not-allowed; }

.btn-icon {
  background:var(--bg3); color:var(--dim); border:none; border-radius:6px;
  width:32px; height:32px; cursor:pointer; font-size:13px;
  display:flex; align-items:center; justify-content:center;
  transition:all 0.15s; flex-shrink:0;
}
.btn-icon:hover  { background:var(--border2); transform:scale(1.08); }
.btn-icon:active { transform:scale(0.95); }
.btn-icon.danger { color:var(--red); }

/* ── Input ── */
.db-input {
  background:var(--bg); border:1px solid var(--border); border-radius:7px;
  padding:10px 12px; color:var(--text); font-size:14px; outline:none; width:100%;
  font-family:'DM Sans',sans-serif; transition:border-color 0.2s;
  -webkit-appearance:none;
}
.db-input:focus { border-color:var(--purple); }

/* ── Skeleton shimmer ── */
.sk-block {
  background:linear-gradient(90deg,#0a1628 25%,#0f1f3d 50%,#0a1628 75%);
  background-size:800px 100%; animation:shimmer 1.4s infinite linear; border-radius:6px;
}

/* ── Calendar modal ── */
.cal-overlay {
  position:fixed; inset:0; background:rgba(2,9,23,0.88);
  display:flex; align-items:center; justify-content:center;
  z-index:200; backdrop-filter:blur(8px); padding:16px;
}
.cal-card {
  background:var(--bg2); border:1px solid var(--border2); border-radius:20px;
  padding:20px; width:100%; max-width:340px; animation:celebrate 0.3s ease;
  max-height:90vh; overflow-y:auto;
}

/* ── Goal picker modal ── */
.goal-overlay {
  position:fixed; inset:0; background:rgba(2,9,23,0.94);
  display:flex; align-items:center; justify-content:center;
  z-index:200; backdrop-filter:blur(10px); padding:12px;
}
.goal-card {
  background:var(--bg2); border:1px solid var(--border2); border-radius:22px;
  padding:20px 16px; width:100%; max-width:700px;
  max-height:92vh; overflow-y:auto; animation:celebrate 0.3s ease;
  -webkit-overflow-scrolling:touch;
}
.goal-item {
  background:var(--bg); border:1.5px solid #1a2540; border-radius:14px;
  padding:12px; cursor:pointer; text-align:left; transition:all 0.18s; width:100%;
}
.goal-item:hover { border-color:var(--accent); transform:translateY(-2px); }
.goal-grid {
  display:grid; grid-template-columns:repeat(2,1fr); gap:10px;
}
@media(min-width:480px){ .goal-grid{grid-template-columns:repeat(3,1fr);} }
@media(min-width:640px){ .goal-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));} }

/* ── Constellation popup ── */
.const-popup {
  position:absolute; left:50%; transform:translateX(-50%);
  top:calc(100% + 8px); z-index:60; width:calc(100vw - 40px); max-width:360px;
  filter:drop-shadow(0 10px 30px rgba(0,0,0,0.9));
  animation:popIn 0.2s ease; pointer-events:auto;
}

/* ── Profile dropdown ── */
.profile-dd {
  position:absolute; right:0; top:calc(100% + 10px);
  background:var(--bg3); border:1px solid var(--border2); border-radius:16px;
  min-width:220px; width:calc(100vw - 40px); max-width:260px;
  padding:8px; box-shadow:0 16px 40px rgba(0,0,0,0.7); z-index:100;
  animation:fadeIn 0.18s ease;
}

/* ── Celebration overlay ── */
.celebration {
  position:fixed; inset:0; background:rgba(2,9,23,0.97);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  z-index:300; padding:24px; text-align:center;
}

/* ── Streak badge ── */
.streak-badge {
  border-radius:999px; padding:3px 10px; font-size:12px; font-weight:700;
  white-space:nowrap;
}

/* ── Weekly mini-bar ── */
.weekly-bar { display:flex; gap:3px; align-items:flex-end; }
.weekly-dot { width:7px; height:14px; border-radius:2px; transition:background 0.3s; }

/* ── Responsive text ── */
.title-sm { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; }
@media(min-width:640px){ .title-sm{font-size:18px;} }
`;

const INP_STYLE = {
    background:"var(--bg)", border:"1px solid var(--border)", borderRadius:7,
    padding:"10px 12px", color:"var(--text)", fontSize:14, outline:"none",
    width:"100%", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box",
    WebkitAppearance:"none",
};

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function HabitCardSkeleton() {
    return (
        <div className="habit-card">
            <div style={{ display:"flex", justifyContent:"space-between" }}>
                <div style={{ flex:1, marginRight:10 }}>
                    <div className="sk-block" style={{ height:13, width:"60%", marginBottom:7 }} />
                    <div className="sk-block" style={{ height:10, width:"40%" }} />
                </div>
                <div style={{ display:"flex", gap:4 }}>
                    {[1,2,3].map(i => <div key={i} className="sk-block" style={{ width:32, height:32, borderRadius:6 }} />)}
                </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
                <div className="sk-block" style={{ height:22, width:80, borderRadius:999 }} />
                <div className="sk-block" style={{ height:22, width:60, borderRadius:999 }} />
            </div>
            <div className="sk-block" style={{ height:34, borderRadius:8 }} />
            <div className="sk-block" style={{ height:42, borderRadius:9 }} />
            <div className="sk-block" style={{ height:36, borderRadius:9 }} />
        </div>
    );
}

// ─── ConstellationHoverMap ─────────────────────────────────────────────────────
function ConstellationHoverMap({ constellation, streak }) {
    const [hIdx, setHIdx] = useState(null);
    if (!constellation) return null;
    const isMobile = window.innerWidth < 480;
    const W = isMobile ? 280 : 320, H = isMobile ? 165 : 185, pad = 13;
    const px = nx => pad + (nx / 100) * (W - pad * 2);
    const py = ny => pad + (ny / 100) * (H - pad * 2);
    const { stars, lines, days } = constellation;
    const done = Math.min(streak, days);
    return (
        <div style={{ position:"relative" }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block", borderRadius:10 }}>
                <defs>
                    <radialGradient id="hbg" cx="50%" cy="50%" r="70%">
                        <stop offset="0%"   stopColor="#0d1b35" />
                        <stop offset="100%" stopColor="#020917" />
                    </radialGradient>
                    <filter id="hgl"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <rect width={W} height={H} fill="url(#hbg)" rx={10} />
                {Array.from({length:16}).map((_,i)=>(<circle key={i} cx={(((i*137.5)%100)/100)*W} cy={(((i*97.3)%100)/100)*H} r={0.5} fill="#f0f9ff" fillOpacity={0.06}/>))}
                {lines.map(([a,b],i)=>{ const lit=a<done&&b<done; return <line key={i} x1={px(stars[a].x)} y1={py(stars[a].y)} x2={px(stars[b].x)} y2={py(stars[b].y)} stroke={lit?"#c4d9f5":"#0f1f35"} strokeWidth={lit?1.2:0.5} strokeOpacity={lit?0.6:0.2}/>; })}
                {stars.map((s,i)=>{
                    const isDone=i<done,isNext=i===done,hov=hIdx===i;
                    const r=isDone?4.2:isNext?2.8:1.8;
                    return (<g key={i} onMouseEnter={()=>setHIdx(i)} onMouseLeave={()=>setHIdx(null)} style={{cursor:"default"}}>
                        <circle cx={px(s.x)} cy={py(s.y)} r={18} fill="transparent"/>
                        {!isDone&&<circle cx={px(s.x)} cy={py(s.y)} r={1.8} fill="#1e3a5f" fillOpacity={isNext?0.8:0.35}/>}
                        {isDone&&<circle cx={px(s.x)} cy={py(s.y)} r={hov?12:7} fill="#f0f9ff" fillOpacity={hov?0.13:0.05}/>}
                        {isNext&&<circle cx={px(s.x)} cy={py(s.y)} r={7} fill="none" stroke="#60a5fa" strokeWidth={1} strokeOpacity={0.55} strokeDasharray="2 2"/>}
                        {isDone&&<circle cx={px(s.x)} cy={py(s.y)} r={hov?r+1.5:r} fill="#f0f9ff" filter="url(#hgl)" style={{transition:"all 0.15s"}}/>}
                    </g>);
                })}
                <text x={W-7} y={H-5} textAnchor="end" fontSize={9} fill="#1e3a5f" fontFamily="monospace">{done}/{days}d · {Math.round((done/days)*100)}%</text>
            </svg>
            {hIdx!==null&&<div style={{position:"absolute",top:4,left:`${Math.min(Math.max((stars[hIdx].x/100)*W,50),W-50)}px`,transform:"translateX(-50%)",background:"rgba(4,13,26,0.97)",border:"1px solid #1e3a5f",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:700,color:"var(--text)",whiteSpace:"nowrap",pointerEvents:"none",zIndex:20}}>
                Day {hIdx+1}{hIdx<done?<span style={{color:"var(--accent)",marginLeft:5}}>✓</span>:hIdx===done?<span style={{color:"#60a5fa",marginLeft:5}}>← next</span>:<span style={{color:"var(--dim)",marginLeft:5}}>locked</span>}
            </div>}
        </div>
    );
}

// ─── GoalPicker ────────────────────────────────────────────────────────────────
function GoalPicker({ onSelect, onClose, currentGoal }) {
    return (
        <div className="goal-overlay" onClick={onClose}>
            <div className="goal-card" onClick={e=>e.stopPropagation()}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"var(--text)",marginBottom:4}}>Choose your constellation</div>
                <div style={{fontSize:13,color:"var(--muted)",marginBottom:18}}>Stars light up as your streak grows.</div>
                <div className="goal-grid">
                    {CONSTELLATIONS.map(c=>{
                        const W=160,H=88,p=9;
                        const px=nx=>p+(nx/100)*(W-p*2), py=ny=>p+(ny/100)*(H-p*2);
                        const isCur=currentGoal===c.name;
                        return (
                            <button key={c.name} className="goal-item" onClick={()=>onSelect(c.name)} style={{border:`1.5px solid ${isCur?"var(--purple)":"#1a2540"}`,background:isCur?"rgba(99,102,241,0.12)":"var(--bg)"}}>
                                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{borderRadius:7,display:"block"}}>
                                    <rect width={W} height={H} fill="#020917" rx={7}/>
                                    {c.lines.map(([a,b],i)=><line key={i} x1={px(c.stars[a].x)} y1={py(c.stars[a].y)} x2={px(c.stars[b].x)} y2={py(c.stars[b].y)} stroke="#1e3a5f" strokeWidth={0.8} strokeOpacity={0.7}/>)}
                                    {c.stars.map((s,i)=><circle key={i} cx={px(s.x)} cy={py(s.y)} r={2} fill="#f0f9ff" fillOpacity={0.5}/>)}
                                </svg>
                                <div style={{marginTop:8}}>
                                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"var(--text)"}}>{c.name}</div>
                                    <div style={{fontSize:11,color:"var(--accent)",fontWeight:600,marginTop:1}}>{c.days}d streak</div>
                                    {isCur&&<div style={{fontSize:10,color:"var(--purple)",fontWeight:700,marginTop:3}}>✓ Current</div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button className="btn-sm" onClick={onClose} style={{marginTop:16,background:"var(--border2)",color:"var(--muted)"}}>Cancel</button>
            </div>
        </div>
    );
}

// ─── ConstellationPopup ────────────────────────────────────────────────────────
function ConstellationPopup({ goalConstellation, streak, onChangeGoal }) {
    const pct = goalConstellation ? Math.min(streak/goalConstellation.days,1) : 0;
    return (
        <div className="const-popup">
            <div style={{width:10,height:10,background:"#040d1a",border:"1px solid #1e3a5f",borderBottom:"none",borderRight:"none",transform:"rotate(45deg)",margin:"0 auto -6px"}}/>
            <div style={{background:"#040d1a",border:"1px solid #1e3a5f",borderRadius:15,padding:"14px 14px 11px"}}>
                {goalConstellation?(<>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
                        <div><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"var(--text)"}}>{goalConstellation.name}</span><span style={{fontSize:11,color:"var(--accent)",fontWeight:600,marginLeft:8}}>{goalConstellation.days}d</span><span style={{fontSize:11,color:"var(--purple)",marginLeft:6}}>day {streak}</span></div>
                        <button className="btn-sm" onClick={e=>{e.stopPropagation();onChangeGoal();}} style={{fontSize:10,color:"var(--muted)",background:"#0a1628",border:"1px solid var(--border2)",padding:"3px 8px"}}>change</button>
                    </div>
                    <div style={{height:3,background:"var(--border)",borderRadius:2,marginBottom:10,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:2,width:`${pct*100}%`,background:pct>=1?"linear-gradient(90deg,#4ade80,#22c55e)":"linear-gradient(90deg,var(--purple),var(--purple2))",transition:"width 0.6s"}}/>
                    </div>
                    <ConstellationHoverMap constellation={goalConstellation} streak={streak}/>
                    <div style={{fontSize:10,color:"#1e3a5f",marginTop:7,fontStyle:"italic",lineHeight:1.4}}>"{goalConstellation.myth}"</div>
                    {pct>=1&&<div style={{marginTop:8,textAlign:"center",fontSize:12,color:"var(--accent)",fontWeight:700}}>🏆 Complete! Choose next →</div>}
                </>):(
                    <div style={{textAlign:"center",padding:"10px 0"}}>
                        <div style={{fontSize:26,marginBottom:8}}>✦</div>
                        <div style={{fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:6,fontFamily:"'Syne',sans-serif"}}>Choose your goal</div>
                        <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>Pick a target constellation to unlock.</div>
                        <button className="btn-nav" style={{fontSize:13}} onClick={e=>{e.stopPropagation();onChangeGoal();}}>Pick a Constellation →</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── HabitCalendar ─────────────────────────────────────────────────────────────
function HabitCalendar({ habit, calendar, onClose }) {
    const today=new Date(), year=today.getFullYear(), month=today.getMonth();
    const calSet=new Set(Array.isArray(calendar)?calendar:[]);
    const firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate();
    const monthName=today.toLocaleString("default",{month:"long"});
    const cells=[...Array(firstDay).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
    const key=d=>`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const doneDays=cells.filter(d=>d&&calSet.has(key(d))).length;
    const missedDays=Math.max(0,today.getDate()-doneDays);
    return (
        <div className="cal-overlay" onClick={onClose}>
            <div className="cal-card" onClick={e=>e.stopPropagation()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"var(--text)"}}>{habit.name}</div>
                        <div style={{fontSize:10,color:"var(--muted)",marginTop:1}}>{monthName} {year}</div>
                    </div>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:9,flexWrap:"wrap"}}>
                    {[["#15803d","Done"],["#0a1120","Missed"],["#6366f1","Today"]].map(([c,l])=>(
                        <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#64748b"}}>
                            <div style={{width:9,height:9,borderRadius:2,background:l==="Today"?"transparent":c,border:l==="Today"?`1.5px solid ${c}`:"none"}}/>{l}
                        </div>
                    ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:2}}>
                    {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:"var(--dim)",fontWeight:600}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
                    {cells.map((day,i)=>{
                        if(!day)return<div key={i}/>;
                        const isToday=day===today.getDate(),done=calSet.has(key(day)),isFuture=day>today.getDate(),missed=!done&&!isToday&&!isFuture;
                        return<div key={i} style={{aspectRatio:"1",borderRadius:4,background:done?"#15803d":missed?"#0a1120":"transparent",border:isToday?"1.5px solid #6366f1":done?"1.5px solid #22c55e":"1.5px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:done?700:400,color:done?"#dcfce7":isFuture?"var(--border2)":missed?"#1e3a5f":"var(--muted)",position:"relative"}}>
                            {day}{done&&<span style={{position:"absolute",top:0,right:1,fontSize:5,color:"var(--accent)"}}>✓</span>}
                        </div>;
                    })}
                </div>
                <div style={{marginTop:12,padding:"9px 12px",background:"var(--bg)",borderRadius:9,display:"flex",gap:18,flexWrap:"wrap"}}>
                    {[["var(--accent)","done",doneDays],["var(--red)","missed",missedDays],["#64748b","left",daysInMonth-today.getDate()]].map(([c,l,v])=>(
                        <div key={l}><div style={{fontSize:18,fontWeight:800,color:c,fontFamily:"'Syne',sans-serif"}}>{v}</div><div style={{fontSize:9,color:"var(--dim)"}}>{l}</div></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Celebration ───────────────────────────────────────────────────────────────
function Celebration({ constellation, onDismiss }) {
    useEffect(()=>{ const t=setTimeout(onDismiss,8000); return()=>clearTimeout(t); },[onDismiss]);
    const W=300,H=175,pad=14;
    const px=nx=>pad+(nx/100)*(W-pad*2), py=ny=>pad+(ny/100)*(H-pad*2);
    const{stars,lines,name,days,myth}=constellation;
    return (
        <div className="celebration">
            <div style={{animation:"float 3s ease infinite"}}>
                <div style={{fontSize:50,marginBottom:10}}>✨</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(22px,5vw,27px)",fontWeight:800,color:"var(--text)",marginBottom:8}}>You formed {name}!</div>
                <div style={{fontSize:13,color:"#64748b",maxWidth:320,lineHeight:1.7,marginBottom:5}}>{myth}</div>
                <div style={{fontSize:13,color:"var(--accent)",fontWeight:700,marginBottom:20}}>{days} days 🔥</div>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{borderRadius:14,maxWidth:300}}>
                    <defs><radialGradient id="cbg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0d1b35"/><stop offset="100%" stopColor="#020917"/></radialGradient><filter id="cgl"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                    <rect width={W} height={H} fill="url(#cbg)" rx={14}/>
                    {lines.map(([a,b],i)=><line key={i} x1={px(stars[a].x)} y1={py(stars[a].y)} x2={px(stars[b].x)} y2={py(stars[b].y)} stroke="#c7d9f5" strokeWidth={1.1} strokeOpacity={0.6}/>)}
                    {stars.map((s,i)=><g key={i}><circle cx={px(s.x)} cy={py(s.y)} r={7} fill="#f0f9ff" fillOpacity={0.06}/><circle cx={px(s.x)} cy={py(s.y)} r={3.5} fill="#f0f9ff" filter="url(#cgl)"/></g>)}
                </svg>
            </div>
            <button className="btn-nav" style={{marginTop:24,fontSize:14}} onClick={onDismiss}>Choose Next Target →</button>
        </div>
    );
}

// ─── ProfileDropdown ───────────────────────────────────────────────────────────
function ProfileDropdown({ onLogout }) {
    const [open,setOpen]=useState(false); const [user,setUser]=useState(null);
    const [editing,setEditing]=useState(false); const [newName,setNewName]=useState("");
    const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
    const ref=useRef();
    useEffect(()=>{ apiFetch("/api/users/me",{},{silent:true}).then(d=>{ if(d){setUser(d);setNewName(d.name||"");} }); },[]);
    useEffect(()=>{
        const h=e=>{ if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setEditing(false);} };
        document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
    },[]);
    const saveName=async()=>{
        if(!newName.trim())return; setSaving(true);
        const u=await apiFetch("/api/users/me",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newName.trim()})});
        if(u){setUser(u);setMsg("Saved! ✓");showToast("Name updated!","success");setTimeout(()=>setMsg(""),2000);}
        setEditing(false);setSaving(false);
    };
    const initials=user?.name?user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2):"?";
    return (
        <div ref={ref} style={{position:"relative"}}>
            <button onClick={()=>setOpen(o=>!o)} style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,var(--purple),var(--purple2))",border:"2px solid rgba(255,255,255,0.1)",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.15s",flexShrink:0}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                {initials}
            </button>
            {open&&(
                <div className="profile-dd">
                    <div style={{padding:"10px 12px 10px",borderBottom:"1px solid var(--border2)",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:editing?10:0}}>
                            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,var(--purple),var(--purple2))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#fff",flexShrink:0}}>{initials}</div>
                            <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:700,fontSize:13,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name||"—"}</div>
                                <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email||"—"}</div>
                            </div>
                        </div>
                        {editing?(
                            <div style={{display:"flex",flexDirection:"column",gap:6}}>
                                <input value={newName} onChange={e=>setNewName(e.target.value)} style={{...INP_STYLE,fontSize:12,padding:"6px 9px"}} placeholder="Your name" autoFocus/>
                                <div style={{display:"flex",gap:6}}>
                                    <button className="btn-sm" onClick={saveName} disabled={saving} style={{background:"var(--accent)",color:"#04080f"}}>{saving?"…":"Save"}</button>
                                    <button className="btn-sm" onClick={()=>setEditing(false)} style={{background:"var(--border2)",color:"var(--muted)"}}>Cancel</button>
                                </div>
                                {msg&&<div style={{fontSize:10,color:"var(--accent)"}}>{msg}</div>}
                            </div>
                        ):(
                            <button onClick={()=>setEditing(true)} style={{marginTop:6,width:"100%",padding:"5px 9px",background:"#0f172a",border:"1px solid var(--border2)",borderRadius:7,color:"var(--purple)",fontSize:11,fontWeight:600,cursor:"pointer",textAlign:"left"}}>✎ Edit name</button>
                        )}
                    </div>
                    {[{icon:"◈",label:"Analytics",color:"var(--purple)",action:()=>window.location.href="/analytics"},{icon:"↩",label:"Logout",color:"var(--red)",action:onLogout}].map(({icon,label,color,action})=>(
                        <button key={label} onClick={action}
                                onMouseEnter={e=>e.currentTarget.style.background=`rgba(${color==="var(--red)"?"248,113,113":"99,102,241"},0.08)`}
                                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                                style={{width:"100%",padding:"9px 12px",background:"transparent",border:"none",borderRadius:7,color,fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",transition:"background 0.15s"}}>
                            {icon} {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── HabitCard ─────────────────────────────────────────────────────────────────
function HabitCard({ habit, onDelete, onUpdate, onCelebrate }) {
    const [marked,setMarked]=useState(()=>wasMarkedToday(habit.id));
    const [streak,setStreak]=useState(0); const [longest,setLongest]=useState(0);
    const [weekly,setWeekly]=useState(0); const [calendar,setCalendar]=useState([]);
    const [marking,setMarking]=useState(false); const [editing,setEditing]=useState(false);
    const [editName,setEditName]=useState(habit.name); const [editDesc,setEditDesc]=useState(habit.description||"");
    const [saving,setSaving]=useState(false); const [deleting,setDeleting]=useState(false);
    const [showCal,setShowCal]=useState(false); const [showPopup,setShowPopup]=useState(false);
    const [showGoalPicker,setShowGoalPicker]=useState(false);
    const [goalName,setGoalName]=useState(()=>getStoredGoal(habit.id));
    const cardRef=useRef(); const prevStrRef=useRef(null);
    const goalConst=goalName?CONSTELLATIONS.find(x=>x.name===goalName):null;

    const loadStats=useCallback(async()=>{
        const [s,lng,w,cal]=await Promise.all([
            apiFetch(`/api/logs/${habit.id}/streak`,{},{silent:true}),
            apiFetch(`/api/logs/${habit.id}/longest-streak`,{},{silent:true}),
            apiFetch(`/api/logs/${habit.id}/weekly`,{},{silent:true}),
            apiFetch(`/api/logs/${habit.id}/calendar`,{},{silent:true}),
        ]);
        if(s){
            const ns=s.streak||0;
            if(goalConst&&prevStrRef.current!==null&&prevStrRef.current<goalConst.days&&ns>=goalConst.days) onCelebrate(goalConst);
            prevStrRef.current=ns; setStreak(ns);
        }
        if(lng)setLongest(lng.Streak||0);
        if(w)setWeekly(w.completedDays||0);
        if(Array.isArray(cal)){
            setCalendar(cal);
            const today=new Date().toISOString().split("T")[0];
            if(cal.includes(today))persistMarkToday(habit.id);
            setMarked(wasMarkedToday(habit.id));
        }
    },[habit.id,goalConst,onCelebrate]);

    useEffect(()=>{ loadStats(); },[loadStats]);
    useEffect(()=>{
        if(!showPopup)return;
        const h=e=>{ if(cardRef.current&&!cardRef.current.contains(e.target))setShowPopup(false); };
        document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
    },[showPopup]);

    const handleMark=async()=>{
        if(marked||marking)return; setMarking(true);
        await apiFetch(`/api/logs/${habit.id}/mark`,{method:"POST"});
        persistMarkToday(habit.id); setMarked(true);
        showToast("Habit marked! ✦","success");
        await loadStats(); setMarking(false);
    };
    const saveEdit=async()=>{
        setSaving(true);
        const u=await apiFetch(`/api/habits/${habit.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editName,description:editDesc})});
        if(u){onUpdate(u);setEditing(false);showToast("Updated!","success");}
        setSaving(false);
    };
    const handleDelete=async()=>{
        if(!window.confirm(`Delete "${habit.name}"?`))return;
        setDeleting(true);
        await apiFetch(`/api/habits/${habit.id}`,{method:"DELETE"});
        onDelete(habit.id);
    };
    const handleGoalSelect=n=>{setGoalName(n);setStoredGoal(habit.id,n);setShowGoalPicker(false);showToast(`Goal: ${n}`,"success");};

    return (
        <>
            {showCal&&<HabitCalendar habit={habit} calendar={calendar} onClose={()=>setShowCal(false)}/>}
            {showGoalPicker&&<GoalPicker currentGoal={goalName} onSelect={handleGoalSelect} onClose={()=>setShowGoalPicker(false)}/>}
            <div ref={cardRef} className={`habit-card${marked?" marked":""}`}>
                {/* Header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    {editing?(
                        <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
                            <input value={editName} onChange={e=>setEditName(e.target.value)} style={INP_STYLE} placeholder="Habit name"/>
                            <input value={editDesc} onChange={e=>setEditDesc(e.target.value)} style={INP_STYLE} placeholder="Description"/>
                            <div style={{display:"flex",gap:7}}>
                                <button className="btn-sm" onClick={saveEdit} disabled={saving} style={{background:"var(--accent)",color:"#04080f"}}>{saving?"…":"Save"}</button>
                                <button className="btn-sm" onClick={()=>setEditing(false)} style={{background:"var(--border2)",color:"var(--muted)"}}>Cancel</button>
                            </div>
                        </div>
                    ):(
                        <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:2,wordBreak:"break-word"}}>{habit.name}</div>
                            {habit.description&&<div style={{fontSize:11,color:"var(--dim)",wordBreak:"break-word"}}>{habit.description}</div>}
                        </div>
                    )}
                    {!editing&&(
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                            <button className="btn-icon cal" onClick={()=>setShowCal(true)} title="Calendar" style={{color:"var(--muted)"}}>📅</button>
                            <button className="btn-icon" onClick={()=>setEditing(true)} title="Edit">✎</button>
                            <button className="btn-icon danger" onClick={handleDelete} disabled={deleting} title="Delete">{deleting?"…":"✕"}</button>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                    <span className="streak-badge" style={{background:streak>0?"linear-gradient(135deg,#f59e0b,#ef4444)":"#0f172a",color:streak>0?"#fff":"var(--dim)"}}>
                        {streak>=7?"🔥":streak>=3?"⚡":"✦"} {streak}d streak
                    </span>
                    {longest>0&&<span style={{fontSize:10,color:"var(--muted)",background:"#0a1120",borderRadius:999,padding:"2px 8px",whiteSpace:"nowrap"}}>Best: {longest}d</span>}
                    <div className="weekly-bar">
                        {Array.from({length:7}).map((_,i)=>(
                            <div key={i} className="weekly-dot" style={{background:i<weekly?"#f0f9ff":"var(--border)"}}/>
                        ))}
                    </div>
                </div>

                {/* Constellation toggle */}
                <div style={{position:"relative"}}>
                    <div onClick={()=>setShowPopup(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",background:"var(--bg)",borderRadius:9,border:`1px solid ${showPopup?"#1e3a5f":"var(--border)"}`,cursor:"pointer",transition:"border-color 0.2s",minHeight:40}}>
                        <span style={{fontSize:11,flex:1,paddingRight:8}}>
                            {goalName?<><span style={{color:"var(--purple)",fontWeight:600}}>✦ {goalName}</span><span style={{color:"var(--dim)"}}> · tap to see</span></>:<span style={{color:"var(--dim)",fontWeight:600}}>✦ Set constellation goal</span>}
                        </span>
                        <span style={{fontSize:9,color:showPopup?"var(--purple)":"var(--dim)",flexShrink:0}}>{showPopup?"▲":"▼"}</span>
                    </div>
                    {showPopup&&<ConstellationPopup goalConstellation={goalConst} streak={streak} onChangeGoal={()=>{setShowPopup(false);setShowGoalPicker(true);}}/>}
                </div>

                {/* Mark done button */}
                <button className={`btn-mark${marked?" done":""}`} onClick={handleMark} disabled={marked||marking}
                        style={{background:marked?"linear-gradient(90deg,#f0f9ff,#e2e8f0)":"linear-gradient(90deg,var(--border),#1a2b42)",color:marked?"#04080f":"var(--muted)",opacity:marking?0.7:1}}>
                    {marking?"Saving…":marked?"✦ Shining Today ✓":"Mark as Done"}
                </button>

                {/* Save streak button */}
                <button className="btn-streak" disabled={marked||marking} onClick={handleMark}
                        style={{border:marked?"1.5px solid #22c55e":"1.5px dashed var(--border2)",color:marked?"#22c55e":"#1e3a5f",opacity:marked?0.7:1}}>
                    {marked?"✓ Streak Saved":"🔥 Save Streak"}
                </button>
            </div>
        </>
    );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [habits,setHabits]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(false);
    const [celebration,setCelebration]=useState(null);

    const load=useCallback(()=>{
        setLoading(true);setError(false);
        if(!localStorage.getItem("token")){window.location.href="/";return;}
        apiFetch("/api/habits").then(data=>{
            if(Array.isArray(data))setHabits(data);
            else setError(true);
            setLoading(false);
        });
    },[]);

    useEffect(()=>{ load(); },[load]);

    const handleCelebrate=useCallback(c=>setCelebration(c),[]);
    const handleLogout=()=>{ localStorage.removeItem("token"); window.location.href="/"; };
    const handleDelete=id=>setHabits(p=>p.filter(h=>h.id!==id));
    const handleUpdate=u=>setHabits(p=>p.map(h=>h.id===u.id?u:h));

    return (
        <>
            <style>{CSS}</style>
            <Toast/>
            {celebration&&<Celebration constellation={celebration} onDismiss={()=>setCelebration(null)}/>}
            <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"'DM Sans',sans-serif",paddingBottom:60}}>

                {/* Nav */}
                <nav className="db-nav">
                    <div>
                        <div className="title-sm"><span style={{color:"#f0f9ff",opacity:0.4}}>✦</span> HabitTracker</div>
                        <div style={{fontSize:10,color:"var(--border2)",marginTop:1}}>Map your stars</div>
                    </div>
                    <ProfileDropdown onLogout={handleLogout}/>
                </nav>

                <div className="db-main">
                    {/* Add habit button */}
                    <div style={{marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                        <button className="btn-nav" onClick={()=>window.location.href="/select-habits?mode=add"}>+ New Habit</button>
                        {habits.length>0&&<div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:9,padding:"6px 14px",display:"inline-flex",flexDirection:"column"}}>
                            <span style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"var(--purple)",lineHeight:1}}>{habits.length}</span>
                            <span style={{fontSize:9,color:"var(--dim)"}}>habits</span>
                        </div>}
                    </div>

                    {/* Loading skeletons */}
                    {loading&&<div className="db-habit-grid">{[1,2,3].map(i=><HabitCardSkeleton key={i}/>)}</div>}

                    {/* Error */}
                    {!loading&&error&&(
                        <div style={{textAlign:"center",paddingTop:60,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                            <div style={{fontSize:36}}>⚠️</div>
                            <div style={{color:"var(--red)",fontSize:14,fontWeight:600}}>Could not load habits</div>
                            <div style={{fontSize:12,color:"var(--muted)"}}>Check your connection</div>
                            <button className="btn-nav" style={{fontSize:13}} onClick={load}>↻ Retry</button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading&&!error&&habits.length===0&&(
                        <div style={{textAlign:"center",paddingTop:60}}>
                            <div style={{fontSize:44,marginBottom:12}}>✦</div>
                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"var(--dim)"}}>No habits yet</div>
                            <div style={{fontSize:12,color:"var(--border2)",marginTop:4}}>Tap "+ New Habit" to start</div>
                        </div>
                    )}

                    {/* Habit grid */}
                    {!loading&&!error&&habits.length>0&&(
                        <div className="db-habit-grid">
                            {habits.map(h=><HabitCard key={h.id} habit={h} onDelete={handleDelete} onUpdate={handleUpdate} onCelebrate={handleCelebrate}/>)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}