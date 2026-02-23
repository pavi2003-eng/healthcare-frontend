import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaComments, FaCheck, FaCheckDouble } from 'react-icons/fa';

const DoctorChats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get(`/chats/doctor/${user.doctorId}`);
        console.log('Fetched chats:', res.data);
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
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return '';
    }
  };

  // Get last message based on your API structure
  const getLastMessage = (chat) => {
    if (chat.lastMessage && chat.lastMessage.text) {
      return chat.lastMessage.text;
    }
    return 'No messages yet';
  };

  // Check if message is from current user
  const isMyMessage = (chat) => {
    return chat.lastMessage?.senderName === user.name;
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
      {/* Header */}
      <div className="bg-blue-50 text-blue-800 shadow-sm flex-shrink-0 sticky top-0 z-20 border-b border-blue-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <FaComments className="text-blue-500 text-2xl" />
            <h2 className="text-xl font-semibold">Chats</h2>
            {chats.length > 0 && (
              <span className="text-sm text-blue-500 ml-auto">
                {chats.length} {chats.length === 1 ? 'chat' : 'chats'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-blue-100 rounded-full p-6 mb-4">
              <FaComments className="text-5xl text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No chats yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              When you have conversations with patients, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-blue-100">
            {chats.map((chat, index) => {
              const lastMessageTime = chat.lastMessage?.createdAt || chat.lastMessageAt || chat.createdAt;
              const lastMessageText = getLastMessage(chat);
              const isOwn = isMyMessage(chat);
              
              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/doctor/chats/${chat._id}`}
                    className="block bg-blue-50/70 hover:bg-blue-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-sm">
                          {getInitial(chat.patientName)}
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Chat Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-800 text-base sm:text-lg truncate">
                            {chat.patientName}
                          </h3>
                          {lastMessageTime && (
                            <span className="text-xs text-blue-400 whitespace-nowrap ml-2">
                              {formatTime(lastMessageTime)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-0.5">
                          {/* Message status indicator */}
                          {isOwn && (
                            <span className="text-blue-500 text-xs mr-1">
                              {chat.lastMessage?.read ? <FaCheckDouble /> : <FaCheck />}
                            </span>
                          )}
                          
                          {/* Message text */}
                          <p className={`text-sm truncate flex-1 ${
                            chat.unreadCount > 0 
                              ? 'text-gray-800 font-medium' 
                              : 'text-gray-600'
                          }`}>
                            {isOwn && <span className="text-blue-500 mr-1">You:</span>}
                            {lastMessageText}
                          </p>
                        </div>
                        
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

export default DoctorChats;