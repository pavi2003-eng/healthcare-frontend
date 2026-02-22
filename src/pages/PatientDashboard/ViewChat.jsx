import React, { useEffect, useState, useRef } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const bottomThreshold = 100;
    return scrollHeight - scrollTop - clientHeight < bottomThreshold;
  };

  const handleScroll = () => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setShowScrollButton(!atBottom);
  };

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await API.get(`/chats/${chatId}`);
        setChat(res.data);
        await API.patch(`/chats/${chatId}/read`);
        
        // Scroll to bottom on initial load
        setTimeout(() => {
          scrollToBottom('auto');
        }, 200);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId]);

  // Handle new messages
  useEffect(() => {
    if (!chat?.messages?.length) return;
    
    if (isAtBottom) {
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [chat?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const res = await API.post(`/chats/${chatId}/messages`, {
        sender: user.name,
        text: newMessage
      });
      setChat(res.data.chat);
      setNewMessage('');
      
      // Always scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom('smooth');
        setIsAtBottom(true);
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

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
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
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chat not found</p>
          <button
            onClick={() => navigate('/patient/chats')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = chat.messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-white -m-3 sm:-m-4 md:-m-6" style={{
      position: "absolute",
      width: "100%",
    }}>
      {/* Fixed Header */}
      <div className="bg-white shadow-md border-b border-blue-200 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center px-3 sm:px-4 py-2 sm:py-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition mr-2"
            aria-label="Go back"
          >
            <FaArrowLeft size={isMobile ? 18 : 20} />
          </motion.button>

          <div className="flex-shrink-0 mr-3">
            {chat.doctorProfilePicture ? (
              <img
                src={getImageUrl(chat.doctorProfilePicture)}
                alt={chat.doctorName}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const parent = e.target.parentNode;
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold';
                  fallbackDiv.innerText = getInitial(chat.doctorName);
                  parent.appendChild(fallbackDiv);
                }}
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                {getInitial(chat.doctorName)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-800 text-base sm:text-lg truncate">
              Dr. {chat.doctorName}
            </h2>
            <p className="text-xs text-gray-500 truncate">{chat.subject}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-20"
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className="mb-6">
              {/* Date Separator */}
              <div className="flex justify-center mb-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium">
                  {date}
                </span>
              </div>

              {messages.map((msg, idx) => {
                const isOwn = msg.sender === user.name;
                const isLastMessage = idx === messages.length - 1 && 
                                     date === Object.keys(groupedMessages).pop();
                
                return (
                  <motion.div
                    key={idx}
                    ref={isLastMessage ? lastMessageRef : null}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        isOwn
                          ? 'bg-blue-500 text-white rounded-br-none shadow-md'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-100'
                      }`}
                    >
                      {/* Sender Name (for received messages) */}
                      {!isOwn && (
                        <p className="text-xs font-medium text-blue-600 mb-1">
                          Dr. {msg.sender}
                        </p>
                      )}
                      
                      {/* Message Text */}
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {msg.text}
                      </p>

                      {/* Timestamp */}
                      <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                        isOwn ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span>{formatMessageTime(msg.timestamp)}</span>
                        {isOwn && (
                          <span title={msg.read ? "Read" : "Delivered"}>
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          
          {/* Spacer for last message visibility */}
          <div className="h-16" ref={messagesEndRef} />
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
              setIsAtBottom(true);
            }}
            className="absolute bottom-24 right-4 sm:right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition z-30"
            aria-label="Scroll to bottom"
          >
            <FaArrowDown />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div
        className="bg-white border-t border-blue-200 flex-shrink-0 sticky bottom-0 z-20"
        style={{
          position: "absolute",
          width: "100%",
          bottom: 0,
        }}
      >
        <div className="max-w-3xl mx-auto p-3 sm:p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                rows="1"
                placeholder="Type a message..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none max-h-32 min-h-[52px] text-sm sm:text-base bg-gray-50 hover:bg-white transition"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white p-3 sm:p-4 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0"
              aria-label="Send message"
            >
              <FaPaperPlane size={isMobile ? 16 : 18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientViewChat;