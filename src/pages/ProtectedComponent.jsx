import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ProtectedComponent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // Jika tidak ada pengguna yang terautentikasi, arahkan ke halaman login
      }
      setUser(currentUser);
    });

    return unsubscribe;
  }, [navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Selamat datang, {user.email}</h1>
      {/* Konten yang hanya bisa diakses oleh pengguna terautentikasi */}
    </div>
  );
}
