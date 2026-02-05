import { io } from "socket.io-client";

// URL dari Ngrok Anda
const URL = "https://cody-chronographic-tobi.ngrok-free.dev";

export const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
});