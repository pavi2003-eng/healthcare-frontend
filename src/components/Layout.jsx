import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const imageUrl = user?.profilePicture
    ? `https://healthcare-backend-kj7h.onrender.com${user.profilePicture}`
    : null;

  return (
    <div className="flex h-screen bg-gray-100">

      <Toaster position="top-center" />

      <Sidebar
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`
          flex-1 flex flex-col transition-all duration-300
        `}
      >
        {/* HEADER */}
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">

          <div className="flex items-center gap-3">

            {/* Clean Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <FaBars size={20} />
            </button>

            <h1 className="text-lg font-semibold text-gray-800">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <Link
              to={`/${user?.role}/profile`}
              className="flex items-center gap-2"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle size={28} className="text-gray-600" />
              )}
              <span className="hidden sm:block text-sm font-medium">
                My Profile
              </span>
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;