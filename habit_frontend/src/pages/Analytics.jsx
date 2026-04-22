import React, { useEffect, useState, useCallback } from "react";
import { CONSTELLATIONS } from "./constellations";
import { apiFetch } from "./apiFetch";
import Toast from "./Toast";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:#020917; --bg2:#070f1e; --bg3:#0a1628;
  --border:#0f1a2e; --border2:#1e293b;
  --text:#f1f5f9; --muted:#475569; --dim:#334155;
  --accent:#4ade80; --purple:#6366f1; --purple2:#8b5cf6;
}

@keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

.an-nav {
  display:flex; justify-content:space-between; align-items:center;
  padding:14px 16px; border-bottom:1px solid var(--border);
  background:rgba(2,9,23,0.96); position:sticky; top:0; z-index:40;
  backdrop-filter:blur(12px);
}
@media(min-width:640px){ .an-nav{padding:18px 36px;} }

.an-main { max-width:1000px; margin:0 auto; padding:20px 14px 60px; }
@media(min-width:640px){ .an-main{padding:32px 20px 60px;} }

.an-grid {
  display:grid; grid-template-columns:1fr; gap:14px;
}
@media(min-width:480px)  { .an-grid{grid-template-columns:repeat(2,1fr);} }
@media(min-width:860px)  { .an-grid{grid-template-columns:repeat(3,1fr); gap:16px;} }

.ms-grid {
  display:grid; grid-template-columns:repeat(2,1fr); gap:8px;
}
@media(min-width:400px) { .ms-grid{grid-template-columns:repeat(3,1fr);} }
@media(min-width:640px) { .ms-grid{grid-template-columns:repeat(auto-fill,minmax(155px,1fr));} }

.an-card {
  background:linear-gradient(145deg,var(--bg2),var(--bg3));
  border:1px solid var(--border); border-radius:17px; padding:18px;
  animation:fadeIn 0.4s ease; display:flex; flex-direction:column; gap:13px;
}

.sk-block {
  background:linear-gradient(90deg,#0a1628 25%,#0f1f3d 50%,#0a1628 75%);
  background-size:800px 100%; animation:shimmer 1.4s infinite linear; border-radius:6px;
}

.ht-bar { position:relative; flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; cursor:default; }
.ht-tip {
  display:none; position:absolute; bottom:calc(100% + 5px); left:50%;
  transform:translateX(-50%); background:rgba(4,13,26,0.97);
  border:1px solid #1e3a5f; border-radius:6px; padding:3px 8px;
  font-size:10px; font-weight:600; color:var(--text); white-space:nowrap;
  pointer-events:none; z-index:30;
}
.ht-bar:hover .ht-tip { display:block; }

.btn-back {
  background:var(--bg2); border:1px solid var(--border2); border-radius:9px;
  padding:7px 14px; color:var(--muted); font-size:13px; font-weight:600;
  cursor:pointer; transition:all 0.18s; white-space:nowrap;
}
.btn-back:hover { background:var(--border2); color:var(--text); }

.retry-btn {
  font-size:11px; color:var(--purple); background:transparent;
  border:1px solid var(--purple); border-radius:6px;
  padding:4px 12px; cursor:pointer; transition:all 0.15s; margin-top:4px;
}
.retry-btn:hover { background:rgba(99,102,241,0.12); }

.ms-card {
  background:var(--bg2); border:1px solid var(--border); border-radius:11px;
  padding:10px 12px; transition:border-color 0.18s;
}
.ms-card:hover { border-color:var(--border2); }

.stat-pill {
  background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:5px 10px;
}
`;

function AnalyticsCardSkeleton() {
    return (
        <div className="an-card">
            <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{flex:1,marginRight:14}}>
                    <div className="sk-block" style={{height:13,width:"55%",marginBottom:6}}/>
                    <div className="sk-block" style={{height:10,width:"35%"}}/>
                </div>
                <div className="sk-block" style={{width:68,height:22,borderRadius:7}}/>
            </div>
            <div style={{display:"flex",gap:8}}>
                {[78,68,62].map((w,i)=><div key={i} className="sk-block" style={{width:w,height:38,borderRadius:8}}/>)}
            </div>
            <div style={{display:"flex",gap:14,alignItems:"flex-end"}}>
                <div className="sk-block" style={{width:70,height:70,borderRadius:35}}/>
                <div style={{flex:1,display:"flex",gap:4,alignItems:"flex-end",height:56}}>
                    {[28,52,16,52,28,52,10].map((h,i)=><div key={i} className="sk-block" style={{flex:1,height:h,borderRadius:3}}/>)}
                </div>
            </div>
            <div className="sk-block" style={{height:86,borderRadius:8}}/>
        </div>
    );
}

function MiniConstellation({ constellationName, streak }) {
    const c=CONSTELLATIONS.find(x=>x.name===constellationName);
    if(!c)return null;
    const W=160,H=88,p=9;
    const px=nx=>p+(nx/100)*(W-p*2), py=ny=>p+(ny/100)*(H-p*2);
    const done=Math.min(streak,c.days);
    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{borderRadius:8,display:"block"}}>
            <rect width={W} height={H} fill="#020917" rx={8}/>
            {c.lines.map(([a,b],i)=>{ const lit=a<done&&b<done; return<line key={i} x1={px(c.stars[a].x)} y1={py(c.stars[a].y)} x2={px(c.stars[b].x)} y2={py(c.stars[b].y)} stroke={lit?"#c4d9f5":"#0f1f35"} strokeWidth={lit?1.1:0.5} strokeOpacity={lit?0.65:0.25}/>; })}
            {c.stars.map((s,i)=>{ const isDone=i<done; return<circle key={i} cx={px(s.x)} cy={py(s.y)} r={isDone?2.8:1.5} fill={isDone?"#f0f9ff":"#1e3a5f"} fillOpacity={isDone?0.9:0.35}/>; })}
        </svg>
    );
}

function WeeklyBar({ weeklyData }) {
    if(!weeklyData?.length) return <div style={{fontSize:11,color:"var(--dim)",fontStyle:"italic",padding:"6px 0"}}>No data</div>;
    if(!weeklyData.some(d=>d.done)) return (
        <div style={{padding:"9px 10px",background:"var(--bg)",borderRadius:8,border:"1px dashed var(--border)",fontSize:11,color:"var(--dim)",fontStyle:"italic"}}>
            No activity this week — mark a habit to start!
        </div>
    );
    return (
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:68}}>
            {weeklyData.map((d,i)=>(
                <div key={i} className="ht-bar">
                    <div className="ht-tip">{d.day} · {d.done?"✓ done":"not done"}</div>
                    <div style={{width:"100%",borderRadius:3,height:d.done?52:9,background:d.done?"linear-gradient(180deg,#4ade80,#16a34a)":"var(--border)",border:d.done?"none":"1px solid var(--border2)",transition:"height 0.4s ease"}}/>
                    <div style={{fontSize:8,color:d.done?"var(--accent)":"var(--dim)",fontWeight:d.done?700:400}}>{d.day.slice(0,2)}</div>
                </div>
            ))}
        </div>
    );
}

function DonutRing({ pct, color, size=68 }) {
    const r=(size-10)/2, circ=2*Math.PI*r, dash=(pct/100)*circ;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={5}/>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct===0?"var(--border2)":color} strokeWidth={5}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dasharray 0.6s ease"}}/>
            <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={11} fontWeight={800}
                  fill={pct===0?"var(--dim)":color} fontFamily="'Syne',sans-serif">{Math.round(pct)}%</text>
        </svg>
    );
}

function StatPill({ label, value, color }) {
    return (
        <div className="stat-pill">
            <div style={{fontSize:15,fontWeight:800,color,fontFamily:"'Syne',sans-serif"}}>{value}</div>
            <div style={{fontSize:9,color:"var(--dim)"}}>{label}</div>
        </div>
    );
}

function HabitAnalyticsCard({ habitId }) {
    const [data,setData]=useState(null);
    const [loaded,setLoaded]=useState(false);
    const [error,setError]=useState(false);

    const load=useCallback(()=>{
        setLoaded(false);setError(false);
        apiFetch(`/api/logs/${habitId}/analytics`,{},{silent:true}).then(d=>{
            if(d)setData(d); else setError(true);
            setLoaded(true);
        });
    },[habitId]);

    useEffect(()=>{ load(); },[load]);

    if(!loaded) return <AnalyticsCardSkeleton/>;

    if(error||!data) return (
        <div className="an-card" style={{alignItems:"center",justifyContent:"center",minHeight:120,animation:"fadeIn 0.3s ease"}}>
            <div style={{fontSize:20}}>⚠️</div>
            <div style={{fontSize:12,color:"var(--muted)",textAlign:"center"}}>Could not load analytics</div>
            <button className="retry-btn" onClick={load}>↻ Retry</button>
        </div>
    );

    const hasActivity=data.weeklyData?.some(d=>d.done);
    const isEmpty=data.currentStreak===0&&data.completedThisWeek===0;

    return (
        <div className="an-card">
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,color:"var(--text)",wordBreak:"break-word"}}>{data.name}</div>
                    {data.description&&<div style={{fontSize:11,color:"var(--dim)",marginTop:2,wordBreak:"break-word"}}>{data.description}</div>}
                </div>
                {data.constellation&&(
                    <div style={{background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:7,padding:"3px 8px",fontSize:10,fontWeight:700,color:"var(--purple)",flexShrink:0,whiteSpace:"nowrap"}}>✦ {data.constellation}</div>
                )}
            </div>

            {/* Stats */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <StatPill label="Current streak" value={`${data.currentStreak}d`} color={data.currentStreak>0?"#f59e0b":"var(--dim)"}/>
                <StatPill label="Best streak"    value={`${data.bestStreak}d`}    color="var(--purple)"/>
                <StatPill label="This week"      value={`${data.completedThisWeek}/7`} color={data.completedThisWeek>0?"var(--accent)":"var(--dim)"}/>
            </div>

            {/* Empty nudge */}
            {isEmpty&&(
                <div style={{fontSize:11,color:"var(--muted)",fontStyle:"italic",padding:"6px 10px",background:"var(--bg)",borderRadius:7,border:"1px dashed var(--border)"}}>
                    ✦ Mark this habit today to start your streak
                </div>
            )}

            {/* Weekly chart */}
            <div>
                <div style={{fontSize:9,color:"var(--dim)",marginBottom:7,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>Last 7 days</div>
                {hasActivity?(
                    <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                        <div style={{textAlign:"center",flexShrink:0}}>
                            <DonutRing pct={data.weeklyPercentage} color="var(--accent)"/>
                            <div style={{fontSize:9,color:"var(--muted)",marginTop:2}}>week</div>
                        </div>
                        <div style={{flex:1,minWidth:120}}><WeeklyBar weeklyData={data.weeklyData}/></div>
                    </div>
                ):(
                    <WeeklyBar weeklyData={data.weeklyData}/>
                )}
            </div>

            {/* Constellation */}
            {data.constellation&&(
                <div>
                    <div style={{fontSize:9,color:"var(--dim)",marginBottom:6,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>{data.constellation} — forming</div>
                    <MiniConstellation constellationName={data.constellation} streak={data.currentStreak}/>
                </div>
            )}

            {/* Progress */}
            {data.nextMilestoneName?(
                <div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--muted)",marginBottom:4}}>
                        <span>{data.constellation||"Start"} ({data.currentStreak}d)</span>
                        <span>{data.nextMilestoneName} ({data.nextMilestoneDays}d)</span>
                    </div>
                    <div style={{height:3,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:2,width:`${Math.round((data.currentStreak/data.nextMilestoneDays)*100)}%`,background:"linear-gradient(90deg,var(--purple),var(--purple2))",transition:"width 0.5s"}}/>
                    </div>
                    <div style={{fontSize:10,color:"var(--dim)",marginTop:3}}>
                        {data.nextMilestoneDays-data.currentStreak} more day{data.nextMilestoneDays-data.currentStreak!==1?"s":""} to {data.nextMilestoneName}
                    </div>
                </div>
            ):(
                <div style={{fontSize:12,color:"var(--accent)",fontWeight:700}}>🏆 All constellations formed!</div>
            )}
        </div>
    );
}

const MILESTONES=[
    {days:3,name:"Triangulum"},{days:7,name:"Crux"},
    {days:10,name:"Aries"},{days:14,name:"Lyra"},
    {days:21,name:"Cassiopeia"},{days:30,name:"Orion"},
    {days:45,name:"Scorpius"},{days:60,name:"Hercules"},
    {days:90,name:"Perseus"},{days:120,name:"Andromeda"},
    {days:150,name:"Ophiuchus"},
];

export default function Analytics() {
    const [habits,setHabits]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(false);

    const load=useCallback(()=>{
        setLoading(true);setError(false);
        apiFetch("/api/habits").then(data=>{
            if(Array.isArray(data))setHabits(data); else setError(true);
            setLoading(false);
        });
    },[]);

    useEffect(()=>{ load(); },[load]);

    return (
        <>
            <style>{CSS}</style>
            <Toast/>
            <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",fontFamily:"'DM Sans',sans-serif"}}>

                {/* Nav */}
                <nav className="an-nav">
                    <div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:800}}>
                            <span style={{color:"#f0f9ff",opacity:0.4}}>◈</span> Analytics
                        </div>
                        <div style={{fontSize:10,color:"var(--border2)",marginTop:1}}>Your habit insights</div>
                    </div>
                    <button className="btn-back" onClick={()=>window.location.href="/dashboard"}>← Dashboard</button>
                </nav>

                <div className="an-main">
                    {/* Spinner */}
                    {loading&&(
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,paddingTop:70}}>
                            <div style={{width:34,height:34,border:"3px solid var(--border)",borderTopColor:"var(--purple)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                            <div style={{fontSize:12,color:"var(--dim)"}}>Loading analytics…</div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading&&error&&(
                        <div style={{textAlign:"center",paddingTop:70,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
                            <div style={{fontSize:34}}>⚠️</div>
                            <div style={{color:"#f87171",fontSize:14,fontWeight:600}}>Could not load habits</div>
                            <button className="btn-back" onClick={load} style={{marginTop:4}}>↻ Retry</button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading&&!error&&habits.length===0&&(
                        <div style={{textAlign:"center",paddingTop:70}}>
                            <div style={{fontSize:38,marginBottom:10}}>✦</div>
                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"var(--dim)"}}>No habits yet</div>
                        </div>
                    )}

                    {/* Content */}
                    {!loading&&!error&&habits.length>0&&(
                        <>
                            <div style={{marginBottom:24}}>
                                <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 18px",display:"inline-block"}}>
                                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"var(--purple)"}}>{habits.length}</div>
                                    <div style={{fontSize:10,color:"var(--dim)",marginTop:1}}>Total Habits</div>
                                </div>
                            </div>

                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:13}}>Per Habit Breakdown</div>
                            <div className="an-grid">
                                {habits.map(h=><HabitAnalyticsCard key={h.id} habitId={h.id}/>)}
                            </div>

                            <div style={{marginTop:40}}>
                                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:13}}>Constellation Milestones</div>
                                <div className="ms-grid">
                                    {MILESTONES.map(m=>(
                                        <div key={m.name} className="ms-card">
                                            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"var(--text)"}}>{m.name}</div>
                                            <div style={{fontSize:10,color:"var(--accent)",fontWeight:600,marginTop:2}}>{m.days} days</div>
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