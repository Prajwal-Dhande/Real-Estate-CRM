import type { Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    // Dynamic require so that socket.io-client and its engine.io shims never load during SSR
    const { io } = require("socket.io-client");
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });

    socket?.on("connect", () => {
      console.log("[Socket.io] Connected to core CRM server:", socket?.id);
    });

    socket?.on("disconnect", (reason: any) => {
      console.log("[Socket.io] Disconnected:", reason);
    });

    socket?.on("connect_error", (error: any) => {
      console.warn("[Socket.io] Connection warning:", error.message);
    });
  }

  return socket;
}
