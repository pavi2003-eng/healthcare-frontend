import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaArrowDown,
  FaCheck,
  FaCheckDouble
} from 'react-icons/fa';

// Helper for image URL
const getImageUrl = (profilePicture) => {
  return profilePicture ? `https://healthcare-backend-kj7h.onrender.com${profilePicture}` : null;
};

const PatientViewChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior
      });
    }
  }, []);

  // Check if at bottom
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 50;
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    isAtBottomRef.current = atBottom;
    setShowScrollButton(!atBottom);
  }, [checkIfAtBottom]);

  // Fetch chat
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await API.get(`/chats/${chatId}`);
        setChat(res.data);
        await API.patch(`/chats/${chatId}/read`);
        
        setTimeout(() => {
          scrollToBottom('auto');
          isAtBottomRef.current = true;
        }, 100);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId, scrollToBottom]);

  // Handle new messages
  useEffect(() => {
    if (!chat?.messages?.length) return;
    
    if (isAtBottomRef.current) {
      scrollToBottom('smooth');
    }
  }, [chat?.messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const res = await API.post(`/chats/${chatId}/messages`, {
        sender: user.name,
        text: newMessage
      });
      setChat(res.data.chat);
      setNewMessage('');
      
      setTimeout(() => {
        scrollToBottom('smooth');
        isAtBottomRef.current = true;
        setShowScrollButton(false);
      }, 100);
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Hide typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch {
      return '';
    }
  };

  // Check if message is read
  const isMessageRead = (msg) => {
    return msg.read === true;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chat not found</p>
          <button
            onClick={() => navigate('/patient/chats')}
            className="text-blue-500 hover:text-blue-600"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = chat.messages?.reduce((groups, message) => {
    if (!message?.createdAt) return groups;
    
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {}) || {};

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      {/* Header - Matching light blue theme */}
      <div className="bg-blue-50 text-blue-800 shadow-sm flex-shrink-0 sticky top-0 z-20 border-b border-blue-200">
        <div className="flex items-center px-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:bg-blue-100 p-2 rounded-full transition mr-2"
            aria-label="Go back"
          >
            <FaArrowLeft size={20} />
          </button>

          <div className="flex-shrink-0 mr-3">
            {chat.doctorProfilePicture ? (
              <img
                src={getImageUrl(chat.doctorProfilePicture)}
                alt={chat.doctorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                {getInitial(chat.doctorName)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-blue-800 text-base sm:text-lg truncate">
              Dr. {chat.doctorName}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages Area - Sky blue background */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-white"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="px-4 py-4 pb-24 max-w-4xl mx-auto">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className="mb-6">
              {date && (
                <div className="flex justify-center mb-4">
                  <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm border border-blue-200">
                    {date}
                  </span>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isOwn = msg.senderName === user.name;
                const isRead = isMessageRead(msg);
                
                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {/* Sender Name (for received messages) */}
                      {!isOwn && (
                        <p className="text-xs font-medium text-blue-600 mb-1">
                          Dr. {msg.senderName}
                        </p>
                      )}
                      
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {msg.text}
                      </p>

                      <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                        isOwn ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isOwn && (
                          <span className="ml-1">
                            {isRead ? <FaCheckDouble /> : <FaCheck />}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              scrollToBottom('smooth');
              setShowScrollButton(false);
              isAtBottomRef.current = true;
            }}
            className="absolute bottom-24 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition z-30"
            aria-label="Scroll to bottom"
          >
            <FaArrowDown />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute bottom-20 left-4 bg-white rounded-full px-4 py-2 shadow-md border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-gray-500">Typing...</span>
          </div>
        </div>
      )}

      {/* Fixed Input Area */}
      <div className="bg-white border-t border-blue-200 flex-shrink-0 sticky bottom-0 z-20">
        <div className="px-4 py-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <textarea
                rows="1"
                placeholder="Type a message..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none max-h-32 min-h-[40px] text-sm bg-gray-50 hover:bg-white transition"
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-3 rounded-full hover:from-blue-500 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
              aria-label="Send message"
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientViewChat;