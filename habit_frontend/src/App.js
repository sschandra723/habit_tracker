import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./pages/AuthContext";
import ProtectedRoute from "./pages/ProtectedRoute";
import Auth from "./pages/Auth";
import SelectHabits from "./pages/SelectHabits";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Auth />} />
                    <Route path="/select-habits" element={
                        <ProtectedRoute><SelectHabits /></ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute><Analytics /></ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;