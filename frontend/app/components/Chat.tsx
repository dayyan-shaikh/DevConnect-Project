import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWebSocket } from '../contexts/WebSocketContext';

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
};

type ChatProps = {
  userId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  onClose: () => void;
};

export function Chat({ userId, otherUser, onClose }: ChatProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle WebSocket messages
  useEffect(() => {
    if (socket?.socket) {
      // Set up message handler
      const handleMessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'chat_message') {
            setMessages(prev => [...prev, message.data]);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      // Add event listener
      socket.socket.addEventListener('message', handleMessage);

      // Send identify message
      if (socket.isConnected) {
        socket.socket.send(JSON.stringify({
          type: 'identify',
          userId
        }));
      }

      // Clean up
      return () => {
        socket.socket?.removeEventListener('message', handleMessage);
      };
    }
  }, [socket, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const message = {
      id: Date.now().toString(),
      senderId: userId,
      receiverId: otherUser.id,
      content: newMessage,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    // Optimistically update UI
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Scroll to bottom after adding new message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);

    try {
      // Send message via WebSocket using the provided sendMessage method
      socket.sendMessage(JSON.stringify({
        type: 'chat_message',
        data: message
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally show error to user
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 h-[500px] bg-white dark:bg-gray-800 shadow-2xl rounded-t-lg flex flex-col z-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            {otherUser.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full rounded-full" />
            ) : (
              <User className="w-4 h-4 text-indigo-600" />
            )}
          </div>
          <span className="font-semibold">{otherUser.name}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-indigo-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-700">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === userId
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-bl-none'
              }`}
            >
              {message.content}
              <div className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

type ChatButtonProps = {
  userId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
};

export function ChatButton({ userId, otherUser }: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Message
      </button>
      
      {isChatOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsChatOpen(false)}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 right-0 w-full md:w-96"
          >
            <Chat 
              userId={userId} 
              otherUser={otherUser} 
              onClose={() => setIsChatOpen(false)} 
            />
          </motion.div>
        </div>
      )}
    </>
  );
}
