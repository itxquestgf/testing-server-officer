import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import auth dari firebase.js
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Setelah login berhasil, arahkan pengguna ke halaman utama (Home)
    } catch (error) {
      setError("Login gagal: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col justify-center items-center">
      <h1 className="text-3xl mb-4">Login</h1>
      <form onSubmit={handleLogin} className="bg-gray-700 p-6 rounded-xl">
        <div className="mb-4">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-600 rounded-lg text-white"
            placeholder="Masukkan email"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-600 rounded-lg text-white"
            placeholder="Masukkan password"
            required
          />
        </div>
        <div className="text-red-500 mb-4">{error}</div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
        >
          Login
        </button>
      </form>
      <Footer />
    </div>
  );
}
