import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUserMd, FaCalendarAlt, FaComments, 
  FaSignOutAlt, FaUserCircle, FaUsers,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isMobile, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (isMobile) setMobileMenuOpen(false);
    
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the system.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      background: isMobile ? '#fff' : undefined,
      width: isMobile ? '90%' : '32rem',
      padding: isMobile ? '1rem' : '1.5rem',
      position: 'center',
      customClass: {
        title: 'text-lg sm:text-xl font-bold text-gray-800',
        htmlContainer: 'text-sm sm:text-base text-gray-600',
        confirmButton: 'px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 rounded-lg font-medium',
        cancelButton: 'px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-600 rounded-lg font-medium',
        popup: 'rounded-xl shadow-2xl',
      },
      buttonsStyling: true,
      reverseButtons: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await logout();
          navigate('/login');
        } catch (error) {
          Swal.showValidationMessage('Logout failed. Please try again.');
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem',
          position: 'center',
        });
      }
    });
  };

  const linkDefinitions = {
    admin: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
      { to: 'patients', label: 'Patients', icon: <FaUsers /> },
      { to: 'profile', label: 'My Profile', icon: <FaUserCircle /> },
    ],
    doctor: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { to: 'chats', label: 'Chats', icon: <FaComments /> },
      { to: 'profile', label: 'My Profile', icon: <FaUserCircle /> },
    ],
    patient: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
      { to: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { to: 'chats', label: 'Chats', icon: <FaComments /> },
      { to: 'profile', label: 'My Profile', icon: <FaUserCircle /> },
    ],
  };

  if (!user) return null;

  const basePath = `/${user.role}`;
  const links = linkDefinitions[user.role] || [];
  const portalTitle = user.role === 'admin' ? 'ADMIN PANEL' : user.role === 'doctor' ? 'DOCTOR PORTAL' : 'PATIENT PORTAL';

  return (
    <AnimatePresence mode="wait">
      {(mobileMenuOpen || !isMobile) && (
        <motion.div 
          initial={{ x: isMobile ? -320 : -20, opacity: isMobile ? 0 : 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            transition: { 
              type: isMobile ? "spring" : "tween",
              damping: 25,
              stiffness: 200,
              duration: isMobile ? undefined : 0.5
            }
          }}
          exit={{ 
            x: isMobile ? -320 : -20, 
            opacity: isMobile ? 0 : 0,
            transition: { duration: isMobile ? 0.2 : 0.3 }
          }}
          className={`sidebar-container fixed md:relative z-50 w-64 bg-white/95 md:bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl flex flex-col h-screen ${
            isMobile ? 'left-0 top-0' : ''
          }`}
        >
          {/* Header with close button on mobile */}
          <div className="p-4 sm:p-5 font-bold text-lg sm:text-xl border-b border-white/30 text-blue-800 flex items-center justify-between">
            <span className="truncate">{portalTitle}</span>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <FaTimes size={18} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="p-3 sm:p-4 border-b border-white/30 bg-blue-50/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{user.name || 'User'}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-3 sm:p-4 space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={`${basePath}/${link.to}`}
                onClick={() => isMobile && setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-100/80 text-blue-700 shadow-md' 
                      : 'text-gray-700 hover:bg-white/50 hover:text-blue-600'
                  }`
                }
              >
                <span className="text-base sm:text-lg">{link.icon}</span>
                <span className="font-medium text-sm sm:text-base truncate">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-3 sm:p-4 border-t border-white/30">
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 w-full text-left text-gray-700 hover:bg-red-50/80 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <FaSignOutAlt className="text-base sm:text-lg" />
              <span className="font-medium text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;