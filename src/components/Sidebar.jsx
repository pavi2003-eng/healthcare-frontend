import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUserMd,
  FaCalendarAlt,
  FaComments,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Sidebar = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: 'You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      confirmButtonColor: '#ef4444'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate('/login');
      }
    });
  };

  const linkDefinitions = {
    admin: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
      { to: 'patients', label: 'Patients', icon: <FaUsers /> },
      { to: 'profile', label: 'My Profile', icon: <FaUserCircle /> }
    ],
    doctor: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'appointments', label: 'Schedule', icon: <FaCalendarAlt /> }, // Changed label to "Schedule" to match image
      { to: 'chats', label: 'Chats', icon: <FaComments /> },
      { to: 'profile', label: 'My Profile', icon: <FaUserCircle /> }
    ],
    patient: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
      { to: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { to: 'chats', label: 'Chats', icon: <FaComments /> },
      { to: 'profile', label: 'My Profile', icon: <FaUserCircle /> }
    ]
  };

  const links = linkDefinitions[user.role] || [];
  const basePath = `/${user.role}`;

  // Helper function to check if current route matches the link
  const isActiveLink = (to) => {
    const fullPath = `${basePath}/${to}`;
    const currentPath = location.pathname;
    
    // For appointments/schedule, check if the path starts with the full path
    // This ensures it stays active on nested routes like /doctor/appointments/list or /doctor/appointments/123
    if (to === 'appointments') {
      return currentPath.startsWith(fullPath);
    }
    
    // For dashboard, check exact match or if it's the root of the role
    if (to === 'dashboard') {
      return currentPath === fullPath || currentPath === basePath;
    }
    
    return currentPath === fullPath;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          ${sidebarOpen ? 'w-64' : 'w-0'}
          transition-all duration-300
          h-screen bg-white shadow-xl border-r z-50
          overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">

          {/* Header */}
          <div className="p-4 border-b font-bold text-blue-700 text-lg">
            {user.role.toUpperCase()} PANEL
          </div>

          {/* User Info */}
          <div className="p-4 border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2">
            {links.map(link => {
              const active = isActiveLink(link.to);
              const fullPath = `${basePath}/${link.to}`;
              
              return (
                <NavLink
                  key={link.to}
                  to={fullPath}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    active
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full p-2 rounded-lg hover:bg-red-50 transition"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;