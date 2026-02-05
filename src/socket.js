import { io } from "socket.io-client";

// URL Ngrok yang Anda dapatkan tadi
const SOCKET_URL = "https://cody-chronographic-tobi.ngrok-free.dev";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Memaksa koneksi stabil
  autoConnect: true
});

// Debugging untuk memastikan koneksi
socket.on("connect", () => {
  console.log("Terhubung ke Server PC via Ngrok: ", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Gagal konek ke Server PC:", err.message);
});