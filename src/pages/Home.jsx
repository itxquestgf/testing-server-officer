import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { MonitorIcon, SettingsIcon, TrainIcon, HomeIcon } from "../components/Icons";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { MdOutlineExitToApp } from "react-icons/md";
import Footer from "../components/Footer";

const wahanaCards = [
  {
    id: "hologram",
    name: "Hologram & Totem",
    path: "/officer/hologram",
    icon: "🗿",
  },
  {
    id: "train",
    name: "Train 1 & 2",
    path: "/officer/train",
    icon: "🚆",
  },
  {
    id: "tunel",
    name: "Tunel & Chamber",
    path: "/officer/tunel",
    icon: "🧠",
  },
  // === UPDATE: Rute Spesifik ===
  {
    id: "dreamfarm",
    name: "Dream Farm",
    path: "/dreamfarm", // Mengarah ke DreamFarm.jsx
    icon: "🐮",
  },
  {
    id: "spacex",
    name: "Space-X",
    path: "/spacex",    // Mengarah ke SpaceX.jsx
    icon: "🚀",
  },
  {
    id: "gondola",
    name: "B.Gondola & Gondola",
    path: "/gondola",   // Mengarah ke Gondola.jsx
    icon: "🚢",
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigate("/login"))
      .catch((error) => console.error("Error during logout:", error));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center px-4 py-8 safe-top safe-bottom animate-gradient">
      
      {/* Tombol Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <MdOutlineExitToApp className="text-3xl text-yellow-400" />
        </button>
      )}

      {/* Logo Section */}
      <div className="mb-8 md:mb-12 text-center fade-in">
        <div className="relative inline-block">
          <img
            src={Logo}
            alt="logo"
            className="w-40 h-auto mx-auto mb-4 md:w-48 lg:w-56 drop-shadow-2xl float-animation"
          />
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl -z-10 scale-in"></div>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-400 fade-in-delay-1">
          Officer Progress
        </h1>
        <p className="text-sm md:text-base text-gray-400 mt-2 fade-in-delay-2">
          Monitoring System
        </p>
      </div>

      {/* Wahana Grid */}
      <div className="w-full max-w-6xl mb-8 md:mb-12 fade-in-delay-2">
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
          <HomeIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          <h2 className="text-lg md:text-xl font-semibold text-center text-gray-300">
            Pilih Wahana
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5">
          {wahanaCards.map((wahana, index) => (
            <Link
              key={wahana.id}
              to={wahana.path}
              className="stagger-item bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700/90 px-4 py-6 md:px-6 md:py-8 rounded-xl text-center font-semibold text-sm md:text-base lg:text-lg transition-all duration-300 shadow-lg hover:shadow-2xl card-hover active:scale-95 border border-gray-700/50 hover:border-yellow-500/70 flex flex-col items-center gap-2 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="text-3xl md:text-4xl lg:text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                {wahana.icon}
              </span>
              <span className="transition-colors duration-300">{wahana.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full max-w-md fade-in-delay-4">
        {user && (
          <Link
            to="/monitor"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-4 md:px-8 md:py-5 rounded-xl font-bold text-center text-base md:text-lg transition-all duration-300 shadow-lg flex-1 flex items-center justify-center gap-2 group glow-effect hover:scale-105"
          >
            <MonitorIcon className="w-5 h-5 md:w-6 md:h-6" />
            <span>MODE MONITOR</span>
          </Link>
        )}

        <Link
          to="/developer"
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-4 md:px-8 md:py-5 rounded-xl font-bold text-center text-base md:text-lg transition-all duration-300 shadow-lg flex-1 flex items-center justify-center gap-2 group hover:scale-105"
        >
          <SettingsIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span>DEVELOPER</span>
        </Link>
      </div>
      <Footer />
    </div>
  );
}