import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaUserMd, FaNotesMedical, FaCommentDots, FaStar, FaPlus } from 'react-icons/fa';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get(`/appointments/patient/${user.patientId}`);
        setAppointments(res.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-blue-500 text-4xl"
        >
          <FaCalendarAlt />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white pt-4 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and action button - more compact */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-blue-800 mb-2 sm:mb-0"
          >
            My Appointments
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/patient/doctors"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition shadow-md text-sm md:text-base"
            >
              <FaPlus className="text-sm" /> Book New
            </Link>
          </motion.div>
        </div>

        {/* Appointments Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-blue-200 overflow-hidden"
        >
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No appointments found.</p>
              <Link
                to="/patient/doctors"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800"
              >
                Book your first appointment →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt /> Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaClock /> Time
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUserMd /> Doctor
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaNotesMedical /> Reason
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-blue-100">
                  {appointments.map((apt, index) => (
                    <motion.tr
                      key={apt._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {apt.appointmentTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {apt.consultingDoctor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {apt.appointmentReason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            apt.status === 'Accepted'
                              ? 'bg-green-100 text-green-800'
                              : apt.status === 'Scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : apt.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {apt.status === 'Accepted' && (
                          <Link
                            to={`/patient/chats?appointment=${apt._id}`}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mr-3"
                          >
                            <FaCommentDots /> Chat
                          </Link>
                        )}
                        {apt.status === 'Completed' && (
                          <Link
                            to={`/patient/rate-doctor/${apt.doctorId}?appointment=${apt._id}`}
                            className="text-green-600 hover:text-green-800 inline-flex items-center gap-1"
                          >
                            <FaStar /> Rate
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
      </div>
    </div>
  );
};

export default PatientAppointments;