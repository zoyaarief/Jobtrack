// src/App.jsx

import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Topbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import Profile from "./pages/Profile.jsx";
import InterviewHub from "./pages/InterviewHub.jsx";
import Homepage from "./pages/Homepage.jsx";
import { api } from "./api.js";
import AddExperienceModal from "./components/AddExperienceModal.jsx";

function RequireAuth({ authed, children }) {
    const location = useLocation();
    if (!authed) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
}

RequireAuth.propTypes = {
    authed: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
};

export default function App() {
    const navigate = useNavigate();
    // Initialize token from storage (if it exists)
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);

    // Convert token to boolean for easy checking
    const isAuthed = !!token;

    /* ----------------------------------------------------------------
       1. 💡 FIX: AUTO-SAVE TOKEN
       Whenever 'token' state changes (e.g. after Login), save it to localStorage.
       This acts as a safety net for Login.jsx.
    ---------------------------------------------------------------- */
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail"); // Clean up email too
        }
    }, [token]);

    /* ----------------------------------------------------------------
       2. 💡 FIX: AUTO-SAVE USER EMAIL
       When we fetch the user, save their email so we can verify ownership later.
    ---------------------------------------------------------------- */
    useEffect(() => {
        async function loadUser() {
            if (!token) {
                setUser(null);
                return;
            }
            try {
                const u = await api.me(token);
                setUser(u);

                // Save email for 'Edit/Delete' permission checks in other components
                if (u && u.email) {
                    localStorage.setItem("userEmail", u.email);
                }
            } catch {
                // If token is invalid, log out
                setUser(null);
                setToken("");
                localStorage.removeItem("token");
                localStorage.removeItem("userEmail");
            }
        }
        loadUser();
    }, [token]);

    function handleLogout() {
        setToken("");
        setUser(null);
        navigate("/");
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <Topbar user={user} onLogout={handleLogout} />

            <main className="flex-grow-1">
                <Routes>
                    <Route
                        path="/login"
                        element={<Login onLogin={setToken} />}
                    />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <RequireAuth authed={isAuthed}>
                                <Dashboard token={token} />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/applications/:id"
                        element={
                            <RequireAuth authed={isAuthed}>
                                <ApplicationDetail token={token} />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <RequireAuth authed={isAuthed}>
                                <Profile token={token} />
                            </RequireAuth>
                        }
                    />

                    {/* 3. 💡 FIX: Pass 'token' and 'user' props
                        This ensures InterviewHub doesn't have to rely on buggy localStorage reading.
                    */}
                    <Route
                        path="/interview-hub"
                        element={<InterviewHub isAuthed={isAuthed} token={token} user={user} />}
                    />

                    {/* Default redirects */}
                    <Route
                        path="/"
                        element={
                            isAuthed ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Homepage />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />

                    {/* If this is a standalone route, it might not need props, but usually it's a modal inside Hub */}
                    <Route
                        path="/interview-hub/add-experience"
                        element={<AddExperienceModal />}
                    />
                </Routes>
            </main>

            <footer className="mt-auto py-4 text-center bg-light border-top">
                <div className="container">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <span className="navbar-brand-modern">JobTrack</span>
                    </div>
                    <p className="text-muted small mb-0">
                        © {new Date().getFullYear()} JobTrack - Professional Job
                        Application Tracker
                    </p>
                </div>
            </footer>
        </div>
    );
}