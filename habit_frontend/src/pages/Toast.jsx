import React, { useEffect, useState } from "react";

const CSS = `
@keyframes toastIn  { from{opacity:0;transform:translateY(-14px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes toastOut { from{opacity:1;transform:translateY(0)}                 to{opacity:0;transform:translateY(-10px)} }

.toast-wrap {
  position:fixed; top:18px; left:50%; transform:translateX(-50%);
  z-index:9999; display:flex; flex-direction:column; align-items:center; gap:8px;
  pointer-events:none;
}
.toast {
  pointer-events:auto;
  display:flex; align-items:center; gap:10px;
  padding:10px 18px; border-radius:12px;
  font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
  box-shadow:0 8px 28px rgba(0,0,0,0.5);
  animation:toastIn 0.25s ease forwards;
  min-width:220px; max-width:380px; cursor:pointer;
}
.toast.exiting { animation:toastOut 0.22s ease forwards; }
.toast.success { background:#052e16; border:1px solid #16a34a; color:#4ade80; }
.toast.error   { background:#1c0a0a; border:1px solid #dc2626; color:#f87171; }
.toast.info    { background:#0a0f2e; border:1px solid #4f46e5; color:#818cf8; }
`;

let _id = 0;

export default function Toast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const { message, type = "error" } = e.detail;
            const id = ++_id;
            setToasts(p => [...p, { id, message, type, exiting: false }]);
            setTimeout(() => dismiss(id), 3500);
        };
        window.addEventListener("app-toast", handler);
        return () => window.removeEventListener("app-toast", handler);
    }, []);

    const dismiss = (id) => {
        setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 230);
    };

    const icons = { success:"✓", error:"✕", info:"ℹ" };

    return (
        <>
            <style>{CSS}</style>
            {toasts.length > 0 && (
                <div className="toast-wrap">
                    {toasts.map(t => (
                        <div key={t.id} className={`toast ${t.type}${t.exiting?" exiting":""}`} onClick={() => dismiss(t.id)}>
                            <span style={{ fontSize:15, flexShrink:0 }}>{icons[t.type]}</span>
                            <span>{t.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

/** Call from anywhere without importing Toast component */
export function toast(message, type = "error") {
    window.dispatchEvent(new CustomEvent("app-toast", { detail: { message, type } }));
}