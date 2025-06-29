import React, { createContext, useContext, useEffect, useRef } from "react";

import { chatSocketService } from "../modules/chat/services/socket.service";

interface SocketContextType {
  socketService: typeof chatSocketService;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
  serverUrl?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  serverUrl = "http://localhost:5000", // Default to backend URL
}) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Initialize socket service
      chatSocketService.init(serverUrl);
      chatSocketService.connect();
      initialized.current = true;
    }

    // Cleanup on unmount
    return () => {
      if (initialized.current) {
        chatSocketService.destroy();
        initialized.current = false;
      }
    };
  }, [serverUrl]);

  const value = {
    socketService: chatSocketService,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
