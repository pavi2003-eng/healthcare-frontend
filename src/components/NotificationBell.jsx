import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckDouble, FaTrash, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllRead } =
    useNotifications();

  const navigate = useNavigate();
  const buttonRef = useRef();

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /*
  ===========================
  CLOSE ON OUTSIDE CLICK
  ===========================
  */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /*
  ===========================
  CALCULATE POSITION
  ===========================
  */
  useEffect(() => {
    if (isOpen && buttonRef.current && !isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, isMobile]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* BELL BUTTON */}
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-white/50"
        aria-label="Notifications"
      >
        <FaBell size={isMobile ? 18 : 20} />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* DROPDOWN PORTAL */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={!isMobile ? {
                position: "fixed",
                top: position.top,
                right: position.right,
                zIndex: 99999,
              } : {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <motion.div
                initial={isMobile ? { scale: 0.9, opacity: 0 } : {}}
                animate={isMobile ? { scale: 1, opacity: 1 } : {}}
                exit={isMobile ? { scale: 0.9, opacity: 0 } : {}}
                className={`
                  bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/30
                  ${isMobile 
                    ? 'w-[90%] max-w-md max-h-[80vh] mx-auto' 
                    : 'w-80'
                  }
                `}
              >
                {/* HEADER */}
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={unreadCount === 0}
                      title="Mark all as read"
                    >
                      <FaCheckDouble size={14} />
                    </button>
                    <button
                      onClick={clearAllRead}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Clear read notifications"
                    >
                      <FaTrash size={14} />
                    </button>
                    {isMobile && (
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                        title="Close"
                      >
                        <FaTimes size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* BODY */}
                <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <FaBell className="text-blue-300 text-xl" />
                      </div>
                      <p className="text-gray-500 text-sm">No notifications</p>
                      <p className="text-xs text-gray-400 mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <motion.div
                        key={notif._id}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3 sm:p-4 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Notification Icon/Indicator */}
                          <div className="flex-shrink-0">
                            {!notif.read && (
                              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${
                              !notif.read ? 'font-semibold text-gray-800' : 'text-gray-600'
                            }`}>
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {formatTime(notif.createdAt)}
                              </span>
                              {notif.link && (
                                <span className="text-xs text-blue-500 hover:underline">
                                  View details
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* FOOTER (for mobile) */}
                {isMobile && notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-xs text-center text-gray-400">
                      Tap notification to {unreadCount > 0 ? 'read and ' : ''}view
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("portal-root")
      )}
    </>
  );
};

export default NotificationBell;