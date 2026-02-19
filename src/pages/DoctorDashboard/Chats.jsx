import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaComments } from 'react-icons/fa';

const DoctorChats = () => {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get(`/chats/doctor/${user.doctorId}`);
        setChats(res.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [user]);

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';
  const getImageUrl = (profilePicture) => {
    return profilePicture ? `https://healthcare-backend-kj7h.onrender.com${profilePicture}` : null;
  };

  return (
    // Offset parent layout padding (p-6) and use full height flex column
    <div className="h-full flex flex-col -m-6">
      {/* Fixed Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-md p-6 border-b border-blue-100 flex-shrink-0">
        <h2 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          <FaComments className="text-blue-500" /> My Chats
        </h2>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {chats.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No chats yet.</p>
          ) : (
            chats.map((chat, index) => (
              <motion.div
                key={chat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <Link
                  to={`/doctor/chats/${chat._id}`}
                  className="block bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all p-4 border border-blue-100"
                >
                  <div className="flex items-center gap-4">
                    {/* Patient Avatar */}
                    <div className="relative">
                      {chat.patientProfilePicture ? (
                        <img
                          src={getImageUrl(chat.patientProfilePicture)}
                          alt={chat.patientName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML += `<div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">${getInitial(chat.patientName)}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {getInitial(chat.patientName)}
                        </div>
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {chat.patientName}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(chat.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {chat.messages?.[chat.messages.length - 1]?.text || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 truncate">{chat.subject}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorChats;