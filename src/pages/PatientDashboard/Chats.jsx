import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaComments, FaUserMd, FaClock, FaArrowRight } from 'react-icons/fa';

// Helper for image URL
const getImageUrl = (profilePicture) => {
  return profilePicture ? `https://healthcare-backend-kj7h.onrender.com${profilePicture}` : null;
};

const PatientChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get(`/chats/patient/${user.patientId}`);
        setChats(res.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [user]);

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-white">
      {/* Fixed Header */}
      <div className="bg-white shadow-md border-b border-blue-100 flex-shrink-0">
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 flex items-center gap-2">
            <FaComments className="text-blue-500" /> 
            <span>My Chats</span>
            {chats.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({chats.length} {chats.length === 1 ? 'chat' : 'chats'})
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 rounded-full p-6 mb-4">
              <FaComments className="text-5xl text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No chats yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              When you start conversations with doctors, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {chats.map((chat, index) => {
              const lastMessage = chat.messages?.[chat.messages.length - 1];
              const lastMessageTime = lastMessage?.timestamp || chat.lastUpdated;
              
              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-blue-100 overflow-hidden"
                >
                  <Link
                    to={`/patient/chats/${chat._id}`}
                    className="block p-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Doctor Avatar */}
                      <div className="relative flex-shrink-0">
                        {chat.doctorProfilePicture ? (
                          <img
                            src={getImageUrl(chat.doctorProfilePicture)}
                            alt={chat.doctorName}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-blue-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              const parent = e.target.parentNode;
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg';
                              fallbackDiv.innerText = getInitial(chat.doctorName);
                              parent.appendChild(fallbackDiv);
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">
                            {getInitial(chat.doctorName)}
                          </div>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg truncate">
                            Dr. {chat.doctorName}
                          </h3>
                          <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap">
                            {formatTime(lastMessageTime)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                          {lastMessage?.text || 'No messages yet'}
                        </p>
                        
                        {chat.subject && (
                          <p className="text-xs text-blue-600 mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded-full">
                            {chat.subject}
                          </p>
                        )}
                      </div>

                      {/* Arrow indicator - hidden on mobile, shown on desktop */}
                      <div className="hidden sm:block text-gray-400">
                        <FaArrowRight />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientChats;