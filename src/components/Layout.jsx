import React, { useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Layout = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log("===== LAYOUT DEBUG =====");
    console.log("USER OBJECT:", user);
    console.log("USER NAME:", user?.name);
    console.log("PROFILE PICTURE RAW:", user?.profilePicture);
    const debugUrl = user?.profilePicture
      ? `https://healthcare-backend-kj7h.onrender.com${user.profilePicture}`
      : null;
    console.log("FINAL IMAGE URL:", debugUrl);
    console.log("========================");
  }, [user]);

  const imageUrl = user?.profilePicture
    ? `https://healthcare-backend-kj7h.onrender.com${user.profilePicture}`
    : null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Glass‑morphism header */}
        <header className="bg-white/70 backdrop-blur-md border-b border-white/30 shadow-lg p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
             Welcome, {user?.name}
          </h1>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <Link
              to={`/${user?.role}/profile`}
              className="flex items-center"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Profile"
                  onLoad={() => console.log("✅ IMAGE LOADED")}
                  onError={(e) => {
                    console.log("❌ IMAGE FAILED:", imageUrl);
                    e.target.style.border = "2px solid red";
                  }}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-md hover:ring-blue-300 transition-all"
                />
              ) : (
                <FaUserCircle
                  size={32}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                />
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;