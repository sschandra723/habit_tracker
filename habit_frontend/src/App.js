import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./pages/AuthContext";
import ProtectedRoute from "./pages/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import SelectHabits from "./pages/SelectHabits";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Toast from "./pages/Toast";
import "./pages/keepalive"; // pings /health every 14 min → prevents Render cold starts

/* Redirect logged-in users away from landing / auth pages */
function PublicRoute({ children }) {
    const { token, loading } = useAuth();
    if (loading) return (
        <div style={{
            minHeight:"100vh", background:"#020917",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#1e3a5f", fontFamily:"'DM Sans',sans-serif", fontSize:13,
        }}>✦ Loading…</div>
    );
    // Already logged in → go straight to dashboard
    if (token) return <Navigate to="/dashboard" replace />;
    return children;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                {/* Global toast — renders above everything */}
                <Toast />
                <Routes>
                    {/* ── Public routes ── */}
                    <Route path="/" element={
                        <PublicRoute><LandingPage /></PublicRoute>
                    } />
                    <Route path="/auth" element={
                        <PublicRoute><Auth /></PublicRoute>
                    } />

                    {/* ── Protected routes ── */}
                    <Route path="/select-habits" element={
                        <ProtectedRoute><SelectHabits /></ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute><Analytics /></ProtectedRoute>
                    } />

                    {/* ── Fallback ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;