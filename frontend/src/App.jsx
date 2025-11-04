import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App() {
   const [token, setToken] = useState(
      () => localStorage.getItem("token") || ""
   );

   function handleLogin(nextToken) {
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
   }

   return (
      <div className='d-flex flex-column min-vh-100'>
         <Topbar />
         <Routes>
            <Route path='/login' element={<Login onLogin={handleLogin} />} />
            <Route path='/register' element={<Register />} />
            <Route path='/' element={<Navigate to='/login' replace />} />
         </Routes>
         <footer className='mt-auto py-4 text-center text-secondary small'>
            <div className='container'>
               © {new Date().getFullYear()} JobTrack
            </div>
         </footer>
      </div>
   );
}
