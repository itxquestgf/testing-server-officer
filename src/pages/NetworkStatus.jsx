import { useEffect, useState } from "react";
import { IoIosWifi } from "react-icons/io";

export default function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShow(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed top-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg text-white text-sm
        ${online ? "bg-green-600" : "bg-red-600"}`}
    >
      <IoIosWifi size={18} />
      {online ? "Connected" : "Disconnected"}
    </div>
  );
}
