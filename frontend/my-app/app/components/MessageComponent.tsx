'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useSendMessage, useGetConversation, type Message, type CreateMessagePayload } from '../api/messages';

interface MessageComponentProps {
  currentUserId: string;
  otherUserId: string;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
  currentUserId,
  otherUserId,
}) => {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  
  const { socket, isConnected, sendMessage: sendSocketMessage, identify } = useWebSocket();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(
    (data) => {
      console.log('Message sent via HTTP:', data);
      setMessageText('');
      refetch(); // Refresh conversation
    },
    (error) => {
      console.error('Failed to send message via HTTP:', error);
    }
  );
  const { data: conversationData, refetch } = useGetConversation(currentUserId, otherUserId);
  
  // Track all message IDs we've seen to prevent duplicates
  const messageIdTracker = useRef<Set<string>>(new Set());
  // Track the last sent message to handle optimistic updates
  const lastSentMessage = useRef<{id: string, content: string, timestamp: number} | null>(null);

  // Identify user when component mounts
  useEffect(() => {
    if (isConnected && currentUserId) {
      identify(currentUserId);
    }
  }, [isConnected, currentUserId, identify]);

  // Update messages when conversation data changes (initial load)
  useEffect(() => {
    if (conversationData) {
      setMessages(prevMessages => {
        // Only update if we don't have any messages yet
        if (prevMessages.length === 0) {
          // Add all initial messages to the tracker
          conversationData.forEach(msg => messageIdTracker.current.add(msg._id));
          return [...conversationData].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        return prevMessages;
      });
    }
  }, [conversationData]);

  // Listen for incoming real-time messages and server responses
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: any) => {
      
      // Handle wrapped message format
      if (message.type === 'chat_message' && message.data) {
        message = message.data;
      }
      
      // Skip if this is a response to our own message (we handle this separately)
      if (message._tempId && message.senderId === currentUserId) {
        
        // Update the message in the UI with the server's version
        setMessages(prevMessages => {
          const updated = prevMessages.map(m => 
            m._id === message._tempId ? { ...message, _id: message._id } : m
          );
          
          // If message wasn't found by temp ID, add it
          if (!prevMessages.some(m => m._id === message._tempId)) {
            updated.push(message);
          }
          
          return updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        
        return;
      }
      
      // Skip if we've already seen this message
      if (messageIdTracker.current.has(message._id)) {
        return;
      }

      // Mark this message as seen
      messageIdTracker.current.add(message._id);
      
      setMessages(prevMessages => {
        // Double-check for duplicates
        if (prevMessages.some(m => m._id === message._id)) {
          return prevMessages;
        }
        
        const newMessages = [...prevMessages, message].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return newMessages;
      });
    };

    socket.on('message', handleMessage);
    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket, currentUserId]);

  const testAPI = async () => {
    try {
      const testData = {
        senderId: currentUserId,
        receiverId: otherUserId,
        content: 'Test message'
      };
      
      console.log('Testing API connection...');
      console.log('Test data being sent:', testData);
      console.log('Test data JSON:', JSON.stringify(testData));
      
      const response = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      console.log('Test API response:', response.status, response.statusText);
      const data = await response.json();
      console.log('Test API data:', data);
    } catch (error) {
      console.error('Test API error:', error);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUserId || !otherUserId) {
      return;
    }

    const now = Date.now();
    const tempId = `temp-${now}`;
    const messageData: CreateMessagePayload = {
      senderId: currentUserId,
      receiverId: otherUserId,
      content: messageText.trim(),
      _id: tempId,
      _isNew: true,
      _timestamp: now
    };

    
    // Track this message
    messageIdTracker.current.add(tempId);
    lastSentMessage.current = {
      id: tempId,
      content: messageText.trim(),
      timestamp: now
    };
    
    // Create a temporary message for optimistic UI
    const tempMessage: Message = {
      _id: tempId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: messageText.trim(),
      isRead: false,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      _tempId: tempId, // Store the temp ID for matching with server response
      _isNew: true,
      _timestamp: now
    };

    // Add the message to the UI immediately with temp ID
    setMessages(prev => {
      // Remove any previous temporary messages with the same content
      const filtered = prev.filter(m => 
        !(m._tempId && m.content === messageText.trim() && 
          Math.abs(new Date(m.createdAt).getTime() - now) < 2000)
      );
      
      const newMessages = [...filtered, tempMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return newMessages;
    });
    
    // Clear the input field
    setMessageText('');
    
    // Track this message
    messageIdTracker.current.add(tempId);
    lastSentMessage.current = {
      id: tempId,
      content: messageText.trim(),
      timestamp: now
    };
    
    // Send via WebSocket if connected, otherwise fallback to HTTP
    if (isConnected) {
      // Create the WebSocket message with all required fields
      const wsMessage = {
        type: 'chat_message',
        data: {
          senderId: currentUserId,
          receiverId: otherUserId,
          content: messageText.trim(),
          _tempId: tempId,
          _isNew: true,
          _timestamp: now
        }
      };
      
      sendSocketMessage(wsMessage);
    } else {
      sendMessage(messageData);
    }
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg p-4">
      {/* Debug Info */}
      <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
        <div>Current User: {currentUserId}</div>
        <div>Other User: {otherUserId}</div>
        <div>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</div>
        <div>Sending: {isSending ? 'Yes' : 'No'}</div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`p-2 rounded-lg max-w-xs ${
              message.senderId === currentUserId
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2 mb-2">
        <button
          onClick={testAPI}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
        >
          Test API
        </button>
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => {
            console.log('Input changed:', e.target.value);
            setMessageText(e.target.value);
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSending}
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending || !messageText.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default MessageComponent;
