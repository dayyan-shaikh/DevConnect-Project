import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { AuthenticatedRoute } from "../components/ProtectedRoute";
import { Navbar } from "../components/Navbar";
import { MessageCircle, Search, MoreVertical, Send, ArrowLeft } from "lucide-react";
import { useGetConversations, useGetConversation, useSendMessage, type Message, type ConversationResponse } from "../api/messages";
import { useWebSocket } from "../contexts/WebSocketContext";
import { getCurrentUserId } from "../lib/auth";
import { toast } from "sonner";

// Utility function to get initials from a name
function getInitials(name: string | undefined): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to get the partner name from a conversation
function getPartnerName(conversation: ConversationResponse, currentUserId: string | null): string {
  if (!currentUserId) return '';
  return conversation.partnerName || `User ${conversation.partnerId?.slice(-4)}`;
}

export function meta() {
  return [
    { title: "Messages - DevConnect" },
    { name: "description", content: "Your DevConnect messages" },
  ];
}

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { socket, isConnected, sendMessage: sendSocketMessage, identify } = useWebSocket();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(
    (data) => {
      console.log('Message sent via HTTP:', data);
      setMessageText('');
      refetchConversation();
    },
    (error) => {
      console.error('Failed to send message via HTTP:', error);
    }
  );

  const { data: conversations, refetch: refetchConversations } = useGetConversations(currentUserId || '');
  const { data: conversationMessages, refetch: refetchConversation } = useGetConversation(
    currentUserId || '', 
    selectedConversation || '', 
    !!selectedConversation
  );

  // Get current user ID
  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
    if (userId) {
      identify(userId);
    }
  }, [identify]);

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      const handleMessage = (message: Message) => {
        console.log('Received message:', message);
        refetchConversations();
        if (selectedConversation && 
            (message.senderId === selectedConversation || message.receiverId === selectedConversation)) {
          refetchConversation();
        }
      };

      socket.on('message', handleMessage);
      return () => {
        socket.off('message', handleMessage);
      };
    }
  }, [socket, selectedConversation, refetchConversations, refetchConversation]);

  // Set initial conversation from URL params
  useEffect(() => {
    const chatWith = searchParams.get('chat');
    if (chatWith) {
      setSelectedConversation(chatWith);
    }
  }, [searchParams]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUserId || !selectedConversation) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: selectedConversation,
      content: messageText.trim(),
    };

    sendMessage(messageData);
    if (isConnected) {
      sendSocketMessage(messageData);
    }
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.partnerId?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!currentUserId) {
    return (
      <AuthenticatedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-gray-300">Getting your messages ready...</p>
          </div>
        </div>
      </AuthenticatedRoute>
    );
  }

  return (
    <>
      <Navbar />
      <AuthenticatedRoute>
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="w-full h-screen pt-16 flex">
            {/* Conversations Sidebar */}
            <div className="w-1/3 bg-white/5 backdrop-blur-sm border-r border-white/10 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">Messages</h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a conversation from a developer's profile</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.partnerId}
                        onClick={() => setSelectedConversation(conv.partnerId)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conv.partnerId
                            ? 'bg-purple-600/20 border border-purple-500/30'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {getInitials(conv.partnerName) || conv.partnerId?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white truncate">
                                {conv.partnerName || `User ${conv.partnerId?.slice(-4)}`}
                              </h3>
                              <span className="text-xs text-gray-400">
                                {conv.lastMessage?.createdAt 
                                  ? new Date(conv.lastMessage.createdAt).toLocaleDateString()
                                  : ''
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 truncate">
                              {conv.lastMessage?.content || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-white" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {getInitials(conversations?.find(c => c.partnerId === selectedConversation)?.partnerName)}
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">
                          {conversations?.find(c => c.partnerId === selectedConversation)?.partnerName || `User ${selectedConversation.slice(-4)}`}
                        </h2>
                        <p className="text-sm text-gray-300">
                          {isConnected ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages?.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === currentUserId
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                        disabled={isSending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isSending || !messageText.trim()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
                    <p>Choose a conversation from the sidebar to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AuthenticatedRoute>
    </>
  );
}