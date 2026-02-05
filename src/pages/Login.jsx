import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Validasi lokal (Sesuai kredensial yang Anda minta)
    // Ini bekerja tanpa internet karena hanya mengecek teks yang diinput
    if (email === "officer@gmail.com" && password === "officer123") {
      
      // Simpan status login di browser (localStorage)
      // Ini akan dibaca oleh ProtectedRoute di App.jsx
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      
      setError("");
      navigate("/"); // Arahkan ke halaman utama
    } else {
      setError("Email atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">ITX Quest</h1>
        <p className="text-gray-400">Officer Login Panel</p>
      </div>

      <form 
        onSubmit={handleLogin} 
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Masuk</h2>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-gray-700 rounded-xl text-white border border-transparent focus:border-yellow-400 outline-none transition-all"
            placeholder="officer@gmail.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-gray-700 rounded-xl text-white border border-transparent focus:border-yellow-400 outline-none transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-gray-900 font-bold rounded-xl shadow-lg transition-all"
        >
          LOG IN
        </button>
      </form>

      <Footer />
    </div>
  );
}