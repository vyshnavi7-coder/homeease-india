import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, workerProfile } = useAuth();

  useEffect(() => {
    const backendUrl = (import.meta as any).env?.VITE_API_URL || "/";
    const s = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      setIsConnected(true);
      if (user && user.role === "worker" && workerProfile) {
        s.emit("join_worker_channel", workerProfile.id);
      }
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.id, workerProfile?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
