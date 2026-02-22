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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const imageUrl = user?.profilePicture
    ? `https://healthcare-backend-kj7h.onrender.com${user.profilePicture}`
    : null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-gray-100 relative">
      {/* Toast Container */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px',
            },
          },
        }}
      />

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - responsive */}
      <div className={`
        ${isMobile 
          ? `fixed z-50 transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'relative'
        }
      `}>
        <Sidebar 
          isMobile={isMobile} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Glass-morphism header - responsive */}
        <header className="bg-white/70 backdrop-blur-md border-b border-white/30 shadow-lg px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button - Integrated into header */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-gray-700"
                aria-label="Open menu"
              >
                <FaBars size={20} />
              </button>
            )}
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
              Welcome, {user?.name?.split(' ')[0] || 'User'}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />

            <Link
              to={`/${user?.role}/profile`}
              className="flex items-center gap-2 group"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-blue-300 transition-all"
                />
              ) : (
                <FaUserCircle
                  size={isMobile ? 28 : 32}
                  className="text-gray-600 group-hover:text-blue-600 transition-colors"
                />
              )}
              <span className="hidden sm:inline text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                My Profile
              </span>
            </Link>
          </div>
        </header>

        {/* Main content - responsive padding */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;