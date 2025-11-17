/* 
JobTrack App.jsx — review notes (drop-in)

• Preserve intended redirect after login:
  - In Login, navigate to location.state?.from?.pathname ?? "/dashboard" after onLogin(token).

• Centralize auth state:
  - Move token/user + login/logout to an AuthContext (useAuth()) to avoid prop-drilling.

• Safer token handling:
  - Prefer HttpOnly secure cookies; if sticking to localStorage, add a 401 interceptor to auto-logout.

• Reduce flicker on auth check:
  - Show a small “checking session…” skeleton until /me resolves; then render routes.

• Memoize handlers:
  - Wrap handleLogin / handleLogout with useCallback to prevent unnecessary re-renders.

• Route layout cleanup:
  - Use a layout route (<Shell> with <Outlet/>) for Topbar/Footer/background instead of repeating per page.

• Lazy load pages:
  - React.lazy + <Suspense fallback="Loading…"> for Dashboard/Profile/ApplicationDetail to improve TTI.

• Modal routing for AddExperience:
  - Render /interview-hub/add-experience as a modal over InterviewHub using backgroundLocation state.

• Styles & theming:
  - Move inline radial-gradient background into app.css (.app-bg) for consistency and caching.

• Error handling & UX:
  - Centralize error boundary for routes; toast on /me failure and redirect to /login.

*/


import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Topbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import Profile from "./pages/Profile.jsx";
import InterviewHub from "./pages/InterviewHub.jsx";
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
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(null);
    const isAuthed = !!token;

    useEffect(() => {
        async function loadUser() {
            if (!token) {
                setUser(null);
                return;
            }
            try {
                const u = await api.me(token);
                setUser(u);
            } catch {
                setUser(null);
                localStorage.removeItem("token");
                setToken("");
            }
        }
        loadUser();
    }, [token]);

    function handleLogin(nextToken) {
        localStorage.setItem("token", nextToken);
        setToken(nextToken);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail"); // <-- remove stored email too
        setToken("");
        setUser(null);
    }

    return (
        <div
            className="d-flex flex-column min-vh-100"
            style={{
                background: `
        radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.05), transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(244, 114, 182, 0.05), transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(34, 211, 238, 0.05), transparent 50%)
      `,
                backgroundColor: "var(--bg-light)",
            }}
        >
            <Topbar user={user} onLogout={handleLogout} />
            <main className="flex-grow-1">
                <Routes>
                    {/* 🔹 Auth routes */}
                    <Route
                        path="/login"
                        element={
                            isAuthed ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Login onLogin={handleLogin} />
                            )
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            isAuthed ? <Navigate to="/dashboard" replace /> : <Register />
                        }
                    />

                    {/* 🔹 Private routes */}
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


                    {/* 🔹 Public route — your Interview Hub */}
                    <Route path="/interview-hub" element={<InterviewHub />} />

                    {/* 🔹 Default redirects */}
                    <Route
                        path="/"
                        element={
                            isAuthed ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route
                        path="/interview-hub/add-experience"
                        element={<AddExperienceModal />}
                    />

                </Routes>
            </main>

            {/* Footer */}
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
