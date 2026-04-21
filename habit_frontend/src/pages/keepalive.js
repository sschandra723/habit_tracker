// keepalive.js
// Imported once in App.js — starts silently, no output.
// Pings GET /health every 14 minutes so Render's free tier never sleeps.
// (Render spins down after 15 min of inactivity → 50s cold start next request)

const BACKEND        = process.env.REACT_APP_API_URL;
const INTERVAL_MS    = 14 * 60 * 1000; // 14 minutes
let   _started       = false;

function ping() {
    // Skip in local dev to avoid console noise
    if (BACKEND.includes("localhost")) return;
    fetch(`${BACKEND}/health`, { method: "GET" })
        .catch(() => { /* silent — don't throw on network hiccup */ });
}

export function startKeepalive() {
    if (_started) return;
    _started = true;
    // First ping after 2 minutes (let app settle), then every 14 min
    setTimeout(() => {
        ping();
        setInterval(ping, INTERVAL_MS);
    }, 2 * 60 * 1000);
}

// Auto-start when imported
startKeepalive();