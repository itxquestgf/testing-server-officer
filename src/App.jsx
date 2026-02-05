import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import DreamFarm from "./pages/DreamFarm";
import SpaceX from "./pages/SpaceX";
import Gondola from "./pages/Gondola";
import Train from "./pages/Train";
import Tunel from "./pages/Tunel";
import Hologram from "./pages/Hologram";
import Monitor from "./pages/Monitor";
import Developer from "./pages/Developer";
import Login from "./pages/Login";
import NetworkStatus from "./pages/NetworkStatus";

// Komponen Pembungkus Keamanan
function ProtectedRoute({ children }) {
  // Kita cek status login dari localStorage agar bisa kerja offline
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem("isLoggedIn");
    setIsAuthenticated(authStatus === "true");
  }, []);

  if (isAuthenticated === null) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  
  // Jika belum login, lempar ke halaman login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <NetworkStatus />

      <Routes>
        {/* HALAMAN PUBLIK */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* HALAMAN OFFICER (MULTI-BUTTON) */}
        <Route path="/officer/hologram" element={<ProtectedRoute><Hologram /></ProtectedRoute>} />
        <Route path="/officer/train" element={<ProtectedRoute><Train /></ProtectedRoute>} />
        <Route path="/officer/tunel" element={<ProtectedRoute><Tunel /></ProtectedRoute>} />

        {/* HALAMAN OFFICER (SINGLE-BUTTON / NEW) */}
        <Route path="/dreamfarm" element={<ProtectedRoute><DreamFarm /></ProtectedRoute>} />
        <Route path="/spacex" element={<ProtectedRoute><SpaceX /></ProtectedRoute>} />
        <Route path="/gondola" element={<ProtectedRoute><Gondola /></ProtectedRoute>} />

        {/* ADMINISTRASI & MONITORING */}
        <Route path="/monitor" element={<ProtectedRoute><Monitor /></ProtectedRoute>} />
        <Route path="/developer" element={<ProtectedRoute><Developer /></ProtectedRoute>} />

        {/* REDIRECT JIKA RUTE TIDAK ADA */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}