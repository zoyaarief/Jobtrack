import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Topbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function RequireAuth({ authed, children }) {
   const location = useLocation();
   if (!authed) {
      return <Navigate to='/login' replace state={{ from: location }} />;
   }
   return children;
}

export default function App() {
   const [token, setToken] = useState(
      () => localStorage.getItem("token") || ""
   );

   const isAuthed = !!token;

   function handleLogin(nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
   }

   return (
      <div className='d-flex flex-column min-vh-100'>
         <Topbar />
         <Routes>
            <Route
               path='/login'
               element={
                  isAuthed ? (
                     <Navigate to='/dashboard' replace />
                  ) : (
                     <Login onLogin={handleLogin} />
                  )
               }
            />
            <Route
               path='/register'
               element={
                  isAuthed ? <Navigate to='/dashboard' replace /> : <Register />
               }
            />
            <Route
               path='/dashboard'
               element={
                  <RequireAuth authed={isAuthed}>
                     <Dashboard token={token} />
                  </RequireAuth>
               }
            />
            <Route
               path='/'
               element={
                  isAuthed ? (
                     <Navigate to='/dashboard' replace />
                  ) : (
                     <Navigate to='/login ' replace />
                  )
               }
            />
         </Routes>
         <footer className='mt-auto py-4 text-center text-secondary small'>
            <div className='container'>
               © {new Date().getFullYear()} JobTrack
            </div>
         </footer>
      </div>
   );
}
