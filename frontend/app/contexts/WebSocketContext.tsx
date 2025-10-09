'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data: {
    senderId: string;
    receiverId: string;
    content: string;
    _tempId?: string;
    _isNew?: boolean;
    _timestamp?: number;
  };
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage | any) => void;
  identify: (userId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: () => {},
  identify: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  const connect = () => {
    // Determine WebSocket URL based on environment
    let wsUrl: string;
    
    if (import.meta.env.PROD) {
      // In production, use VITE_WEBSOCKET_URL_PRODUCTION if it exists, otherwise fall back to VITE_WEBSOCKET_URL
      wsUrl = import.meta.env.VITE_WEBSOCKET_URL_PRODUCTION || 
              import.meta.env.VITE_WEBSOCKET_URL || 
              'wss://devconnect-project.onrender.com';
    } else {
      // In development, use VITE_WEBSOCKET_URL or fall back to localhost
      wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';
    }
    
    try {
      const socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });
      
      socket.on('connect', () => {
          setIsConnected(true);
        reconnectAttempts.current = 0;
      });
      
      socket.on('disconnect', () => {
          setIsConnected(false);
        attemptReconnect();
      });
      
      socket.on('connect_error', (error) => {
        attemptReconnect();
      });
      
      socketRef.current = socket;
    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
    }
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current += 1;
      setTimeout(connect, reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };

  const sendMessage = useCallback((message: WebSocketMessage | any) => {
    if (socketRef.current?.connected) {
      // If it's already in the wrapped format, send as is but move data to root
      if (message.type && message.data) {
        socketRef.current.emit('sendMessage', {
          type: message.type,
          ...message.data  // Spread data to root level
        });
      } else {
        // For direct message objects, send with type
        socketRef.current.emit('sendMessage', {
          type: 'chat_message',
          ...message  // Spread message data to root level
        });
      }
    } else {
    }
  }, []);

  const identify = (userId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('identify', userId);
    } else {
      console.error('Socket.IO is not connected');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage, identify }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
