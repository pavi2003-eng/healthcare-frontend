import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUserMd, FaCalendarAlt, FaFolder, FaComments, 
  FaSignOutAlt, FaUserCircle, FaChartBar, FaUsers
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
        Swal.fire('Logged out!', 'You have been logged out.', 'success');
      }
    });
  };

  const linkDefinitions = {
    admin: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
      { to: 'patients', label: 'Patients', icon: <FaUsers /> },
      { to: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    ],
    doctor: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { to: 'chats', label: 'Chats', icon: <FaComments /> },
      { to: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    ],
    patient: [
      { to: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
      { to: 'doctors', label: 'Doctors', icon: <FaUserMd /> },
      { to: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { to: 'chats', label: 'Chats', icon: <FaComments /> },
      { to: 'profile', label: 'Profile', icon: <FaUserCircle /> },
    ],
  };

  if (!user) return null;

  const basePath = `/${user.role}`;
  const links = linkDefinitions[user.role] || [];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl flex flex-col h-screen"
    >
      <div className="p-5 font-bold text-xl border-b border-white/30 text-blue-800">
        {user.role === 'admin' ? ' ADMIN PANEL' : user.role === 'doctor' ? ' DOCTOR PORTAL' : ' PATIENT PORTAL'}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={`${basePath}/${link.to}`}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-100/80 text-blue-700 shadow-md' 
                  : 'text-gray-700 hover:bg-white/50 hover:text-blue-600'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/30">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 p-3 w-full text-left text-gray-700 hover:bg-red-50/80 hover:text-red-600 rounded-xl transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;