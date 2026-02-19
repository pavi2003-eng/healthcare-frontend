import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllRead } =
    useNotifications();

  const navigate = useNavigate();
  const buttonRef = useRef();

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
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* BELL BUTTON */}
      <motion.button
        ref={buttonRef}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-white/50"
      >
        <FaBell size={20} />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white"
          >
            {unreadCount}
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
              style={{
                position: "fixed",
                top: position.top,
                right: position.right,
                zIndex: 99999,
              }}
              className="w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/30"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center p-3 bg-blue-50/80 border-b border-white/30">
                <h3 className="font-semibold text-gray-700">
                  🔔 Notifications
                </h3>
                <div className="space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAllRead}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear read
                  </button>
                </div>
              </div>

              {/* BODY */}
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">
                    No notifications
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() =>
                        handleNotificationClick(notif)
                      }
                      className={`p-3 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                        !notif.read
                          ? "bg-blue-50/30"
                          : ""
                      }`}
                    >
                      <p className="text-sm text-gray-800">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          notif.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.getElementById("portal-root")
      )}
    </>
  );
};

export default NotificationBell;
