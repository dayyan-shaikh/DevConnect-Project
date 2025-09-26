import axiosInstance from "./axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  // For WebSocket handling
  _tempId?: string; // For tracking temporary IDs before they're saved
  _isNew?: boolean; // Flag to indicate this is a new message
  _timestamp?: number; // Timestamp for deduplication
}

export interface CreateMessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
  _id?: string; // Optional for temporary messages
  _isNew?: boolean; // Flag for WebSocket handling
  _timestamp?: number; // For deduplication
}

export interface ConversationResponse {
  partnerId: string;
  partnerName: string;
  lastMessage: Message;
}

/* ------------------- API CALLS ------------------- */
const sendMessage = async (data: CreateMessagePayload): Promise<Message> => {
  console.log('API sendMessage called with data:', data);
  console.log('Making POST request to /messages');
  const res = await axiosInstance.post<Message>("/messages", data);
  console.log('API response:', res.data);
  return res.data;
};

const getConversation = async (userA: string, userB: string): Promise<Message[]> => {
  const res = await axiosInstance.get<Message[]>(`/messages/conversation/${userA}/${userB}`);
  return res.data;
};

const getConversations = async (userId: string): Promise<ConversationResponse[]> => {
  const res = await axiosInstance.get<ConversationResponse[]>(`/messages/conversations/${userId}`);
  return res.data;
};

/* ------------------- REACT QUERY HOOKS ------------------- */
export const useSendMessage = (
  onSuccess?: (data: Message) => void,
  onError?: (err: any) => void
) =>
  useMutation({
    mutationFn: sendMessage,
    onSuccess,
    onError,
  });

export const useGetConversation = (userA: string, userB: string, enabled = true) =>
  useQuery({
    queryKey: ["conversation", userA, userB],
    queryFn: () => getConversation(userA, userB),
    enabled: enabled && !!userA && !!userB,
  });

export const useGetConversations = (userId: string, enabled = true) =>
  useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => getConversations(userId),
    enabled: enabled && !!userId,
  });
