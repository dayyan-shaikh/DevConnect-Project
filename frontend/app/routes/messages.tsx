import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AuthenticatedRoute } from "../components/ProtectedRoute";
import { Navbar } from "../components/Navbar";
import { MessageCircle, Search, MoreVertical, Send, ArrowLeft, User, Menu, X, Paperclip, Mic, Smile } from "lucide-react";
import { useGetConversations, useGetConversation, useSendMessage, type Message, type ConversationResponse } from "../api/messages";
import { useProfileByUserId } from "../api/profile";
import { useWebSocket } from "../contexts/WebSocketContext";
import { getCurrentUserId } from "../lib/auth";
import { toast } from "sonner";
import { useMediaQuery } from "../hooks/useMediaQuery";

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

// Custom hook to handle media queries
const useIsMobile = () => useMediaQuery('(max-width: 768px)');

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus input when conversation is selected on mobile
  useEffect(() => {
    if (isMobile && selectedConversation && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [selectedConversation, isMobile]);
  
  const { socket, isConnected, sendMessage: sendSocketMessage, identify } = useWebSocket();
  const { data: conversations = [], refetch: refetchConversations } = useGetConversations(currentUserId || '');
  const { data: conversationMessages = [], refetch: refetchConversation } = useGetConversation(
    currentUserId || '',
    selectedConversation || '',
    !!selectedConversation
  );

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUserId || !selectedConversation) return;
    
    const messageData = {
      senderId: currentUserId,
      receiverId: selectedConversation,
      content: messageText.trim(),
    };
    
    // TODO: Implement message sending logic
    console.log('Sending message:', messageData);
    setMessageText('');
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current conversation profile
  const { data: currentConversationProfile } = useProfileByUserId(selectedConversation || '');

  // Set up WebSocket connection
  useEffect(() => {
    if (currentUserId) {
      identify(currentUserId);
    }
  }, [currentUserId, identify]);

  // Set initial conversation from URL params
  useEffect(() => {
    const chatWith = searchParams.get('chat');
    if (chatWith) {
      setSelectedConversation(chatWith);
      if (isMobile) setIsMobileMenuOpen(false);
    }
  }, [searchParams, isMobile]);

  // Handle back to conversations on mobile
  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setIsMobileMenuOpen(true);
  };

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
            {/* Conversation List */}
            <div className={`${isMobile ? (isMobileMenuOpen ? 'flex' : 'hidden') : 'flex'} w-full md:w-1/3 bg-white/5 backdrop-blur-sm border-r border-white/10 flex-col`}>
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-bold text-white">Messages</h1>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-300">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">Start a conversation from a developer's profile</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.partnerId}
                        onClick={() => {
                          setSelectedConversation(conv.partnerId);
                          if (isMobile) setIsMobileMenuOpen(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conv.partnerId
                            ? 'bg-purple-600/20 border border-purple-500/30'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {conv.partnerAvatar ? (
                              <img 
                                src={conv.partnerAvatar} 
                                alt={conv.partnerName || 'User'} 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                {getInitials(conv.partnerName) || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-white truncate">
                                {conv.partnerName || `User ${conv.partnerId?.slice(-4)}`}
                              </h3>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {conv.lastMessage?.createdAt 
                                  ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate">
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
            {selectedConversation ? (
              <div className={`${isMobile && isMobileMenuOpen ? 'hidden' : 'flex'} flex-1 flex-col h-full`}>
                {/* Chat Header */}
                <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button 
                        onClick={handleBackToConversations}
                        className="md:hidden p-1 text-gray-400 hover:text-white"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    )}
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                      {currentConversationProfile?.avatar ? (
                        <img 
                          src={currentConversationProfile.avatar} 
                          alt={currentConversationProfile.name || 'User'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                          {getInitials(currentConversationProfile?.name) || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-medium text-white">
                        {currentConversationProfile?.name || `User ${selectedConversation.slice(-4)}`}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {isConnected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 sm:p-2 text-gray-400 hover:text-white">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button className="p-1 sm:p-2 text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  className="flex-1 p-2 sm:p-4 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                  {conversationMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 sm:mb-4">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-white mb-1">No messages yet</h3>
                      <p className="text-xs sm:text-sm text-gray-400 max-w-xs sm:max-w-md">
                        Start the conversation by sending your first message
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {conversationMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-2xl px-3 py-2 sm:px-4 ${
                              message.senderId === currentUserId
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-white/10 text-white rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm sm:text-base">{message.content}</p>
                            <p className={`text-[10px] sm:text-xs mt-0.5 opacity-70 ${
                              message.senderId === currentUserId ? 'text-right' : 'text-left'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-2 sm:p-3 border-t border-white/10 bg-slate-900/50">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white">
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full text-sm sm:text-base bg-white/5 border border-white/10 rounded-full py-2 pl-3 sm:pl-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    {messageText ? (
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="p-1.5 sm:p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    ) : (
                      <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white">
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <div className="text-center p-6 max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Select a conversation</h2>
                  <p className="text-gray-400 text-sm">
                    Choose an existing conversation or start a new one from a developer's profile
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AuthenticatedRoute>
    </>
  );
}