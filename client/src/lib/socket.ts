import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket && typeof window !== "undefined") {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected to core CRM server:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.io] Disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.warn("[Socket.io] Connection warning:", error.message);
    });
  }

  return socket as Socket;
}

