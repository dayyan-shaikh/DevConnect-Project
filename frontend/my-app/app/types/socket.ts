import { Socket } from 'socket.io-client';

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServerToClientEvents {
  message: (message: Message) => void;
  // Add other server-to-client events here
}

export interface ClientToServerEvents {
  identify: (userId: string) => void;
  sendMessage: (message: { senderId: string; receiverId: string; content: string }) => void;
  isOnline: (userId: string) => void;
  // Add other client-to-server events here
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
