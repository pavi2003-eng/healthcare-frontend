import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserMd, 
  FaNotesMedical, 
  FaCommentDots, 
  FaStar, 
  FaPlus,
  FaSpinner,
  FaFilter,
  FaChevronRight
} from 'react-icons/fa';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get(`/appointments/patient/${user.patientId}`);
        setAppointments(res.data);
        setFilteredAppointments(res.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  // Filter appointments by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter(apt => apt.status === statusFilter)
      );
    }
  }, [statusFilter, appointments]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800"
          >
            My Appointments
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            {/* Status Filter - Mobile/Desktop */}
            <div className="flex-1 sm:flex-initial relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none pr-8"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Accepted">Accepted</option>
                <option value="Completed">Completed</option>
              </select>
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-xs pointer-events-none" />
            </div>

            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg transition shadow-md text-sm sm:text-base whitespace-nowrap"
            >
              <FaPlus className="text-xs sm:text-sm" /> 
              <span className="hidden xs:inline">Book New</span>
              <span className="xs:hidden">Book</span>
            </Link>
          </motion.div>
        </div>

        {/* Results Count */}
        <div className="mb-3 text-xs sm:text-sm text-gray-500">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 overflow-hidden"
        >
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="bg-blue-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaCalendarAlt className="text-3xl text-blue-300" />
              </div>
              <p className="text-gray-500 text-base sm:text-lg mb-2">No appointments found</p>
              <p className="text-sm text-gray-400 mb-4">
                {statusFilter !== 'all' ? 'Try changing the status filter' : 'Book your first appointment'}
              </p>
              <Link
                to="/patient/doctors"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Browse Doctors <FaChevronRight className="text-xs" />
              </Link>
            </div>
          ) : isMobile ? (
            // Mobile Card View
            <div className="divide-y divide-blue-100">
              {filteredAppointments.map((apt, index) => (
                <motion.div
                  key={apt._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-blue-50/50 transition"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {apt.consultingDoctor?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                          Dr. {apt.consultingDoctor}
                        </h3>
                        <p className="text-xs text-gray-500">{apt.appointmentReason}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 text-blue-600 text-xs mb-1">
                        <FaCalendarAlt /> Date
                      </div>
                      <p className="text-sm font-medium">{formatDate(apt.appointmentDate)}</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="flex items-center gap-1 text-blue-600 text-xs mb-1">
                        <FaClock /> Time
                      </div>
                      <p className="text-sm font-medium">{apt.appointmentTime}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {apt.status === 'Accepted' && (
                      <Link
                        to={`/patient/chats?appointment=${apt._id}`}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                      >
                        <FaCommentDots /> Chat
                      </Link>
                    )}
                    {apt.status === 'Completed' && (
                      <Link
                        to={`/patient/rate-doctor/${apt.doctorId}?appointment=${apt._id}`}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                      >
                        <FaStar /> Rate
                      </Link>
                    )}
                    {apt.status === 'Scheduled' && (
                      <Link
                        to={`/patient/update-appointment/${apt._id}`}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition"
                      >
                        <FaCalendarAlt /> Update
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt /> Date
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaClock /> Time
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUserMd /> Doctor
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaNotesMedical /> Reason
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-blue-100">
                  {filteredAppointments.map((apt, index) => (
                    <motion.tr
                      key={apt._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      className="transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {apt.appointmentTime}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        Dr. {apt.consultingDoctor}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 max-w-[150px] truncate">
                        {apt.appointmentReason}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        {apt.status === 'Accepted' && (
                          <Link
                            to={`/patient/chats?appointment=${apt._id}`}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mr-3 transition"
                          >
                            <FaCommentDots /> Chat
                          </Link>
                        )}
                        {apt.status === 'Completed' && (
                          <Link
                            to={`/patient/rate-doctor/${apt.doctorId}?appointment=${apt._id}`}
                            className="text-green-600 hover:text-green-800 inline-flex items-center gap-1 transition"
                          >
                            <FaStar /> Rate
                          </Link>
                        )}
                        {apt.status === 'Scheduled' && (
                          <Link
                            to={`/patient/update-appointment/${apt._id}`}
                            className="text-yellow-600 hover:text-yellow-800 inline-flex items-center gap-1 transition"
                          >
                            <FaCalendarAlt /> Update
                          </Link>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Summary */}
        {filteredAppointments.length > 0 && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            {appointments.filter(a => a.status === 'Scheduled').length} pending ·{' '}
            {appointments.filter(a => a.status === 'Accepted').length} accepted ·{' '}
            {appointments.filter(a => a.status === 'Completed').length} completed
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;