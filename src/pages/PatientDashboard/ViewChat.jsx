import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaArrowDown } from 'react-icons/fa';

// Helper to build correct image URL
const getImageUrl = (profilePicture) => {
  if (!profilePicture) return null;
  const apiBase = process.env.REACT_APP_API_URL || 'https://healthcare-backend-kj7h.onrender.com/api';
  const staticBase = apiBase.replace(/\/api$/, '');
  return `${staticBase}${profilePicture}`;
};

const PatientViewChat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const nearBottom = isNearBottom();
    setShowScrollButton(!nearBottom);
  };

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await API.get(`/chats/${chatId}`);
        setChat(res.data);
        await API.patch(`/chats/${chatId}/read`);
        setTimeout(() => scrollToBottom('auto'), 100);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [chatId]);

  useEffect(() => {
    if (!chat) return;
    const nearBottom = isNearBottom();
    if (nearBottom) {
      scrollToBottom();
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-blue-500 text-4xl"
        >
          <FaPaperPlane />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-white -m-6">
      {/* Header - flush with edges */}
      <div className="bg-white/80 backdrop-blur-sm shadow-md flex items-center border-b border-blue-100 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-blue-600 p-4 hover:bg-blue-50"
        >
          <FaArrowLeft size={20} />
        </motion.button>

        <div className="flex items-center gap-3 flex-1 py-3 pr-4">
          {chat.doctorProfilePicture ? (
            <img
              src={getImageUrl(chat.doctorProfilePicture)}
              alt={chat.doctorName}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                // Fallback to initials
                const parent = e.target.parentNode;
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow';
                fallbackDiv.innerText = getInitial(chat.doctorName);
                parent.appendChild(fallbackDiv);
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow">
              {getInitial(chat.doctorName)}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-800">Dr. {chat.doctorName}</h2>
            <p className="text-sm text-gray-500">{chat.subject}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
      >
        {chat.messages.map((msg, idx) => {
          const isOwn = msg.sender === user.name;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}
              >
                {!isOwn && (
                  <p className="text-xs text-gray-500 mb-1">{msg.sender}</p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition z-10"
          >
            <FaArrowDown />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm p-4 border-t border-blue-100 flex-shrink-0">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <textarea
            rows="1"
            placeholder="Type a message..."
            className="flex-1 border border-blue-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            <FaPaperPlane />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PatientViewChat;