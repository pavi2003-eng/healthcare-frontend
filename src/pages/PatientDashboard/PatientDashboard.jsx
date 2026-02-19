import React, { useEffect, useState, useRef } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  FaUserMd,
  FaCalendarCheck,
  FaStar,
  FaHeartbeat,
  FaStethoscope,
  FaSyringe,
  FaPills,
  FaClinicMedical,
} from 'react-icons/fa';

// DoctorAvatar component with proper error handling
const DoctorAvatar = ({ doctor }) => {
  const [imageError, setImageError] = useState(false);

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';
  const getImageUrl = (profileImage) => {
    // Use environment variable for API base URL if available
    const baseURL =  'https://healthcare-backend-kj7h.onrender.com/';
    return profileImage ? `${baseURL}${profileImage}` : null;
  };

  const imageUrl = doctor.profileImage ? getImageUrl(doctor.profileImage) : null;

  if (!imageUrl || imageError) {
    // Fallback: show initials
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
        {getInitial(doctor.fullName)}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={doctor.fullName}
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};

const PatientDashboard = () => {
  const containerRef = useRef(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const { user } = useAuth();

  // Mouse parallax animation (same as admin/doctor)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const icon1X = useTransform(smoothX, [-1, 1], [-30, 30]);
  const icon1Y = useTransform(smoothY, [-1, 1], [-30, 30]);
  const icon2X = useTransform(smoothX, [-1, 1], [20, -20]);
  const icon2Y = useTransform(smoothY, [-1, 1], [20, -20]);
  const icon3X = useTransform(smoothX, [-1, 1], [-40, 40]);
  const icon3Y = useTransform(smoothY, [-1, 1], [40, -40]);
  const icon4X = useTransform(smoothX, [-1, 1], [30, -30]);
  const icon4Y = useTransform(smoothY, [-1, 1], [-20, 20]);
  const icon5X = useTransform(smoothX, [-1, 1], [-20, 20]);
  const icon5Y = useTransform(smoothY, [-1, 1], [30, -30]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, aptRes] = await Promise.all([
          API.get('/doctors'),
          API.get(`/appointments/patient/${user.patientId}`)
        ]);
        setDoctors(docsRes.data);
        console.log('First doctor:', docsRes.data[0]); // Check profileImage field
        setAppointments(aptRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user]);

  const topRated = [...doctors]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-white"
    >
      {/* Floating Icons */}
      <motion.div style={{ x: icon1X, y: icon1Y }} className="absolute top-20 left-10 text-blue-300 text-5xl opacity-30">
        <FaHeartbeat />
      </motion.div>
      <motion.div style={{ x: icon2X, y: icon2Y }} className="absolute bottom-20 right-10 text-blue-300 text-6xl opacity-30">
        <FaStethoscope />
      </motion.div>
      <motion.div style={{ x: icon3X, y: icon3Y }} className="absolute top-1/3 right-20 text-blue-300 text-5xl opacity-20">
        <FaSyringe />
      </motion.div>
      <motion.div style={{ x: icon4X, y: icon4Y }} className="absolute bottom-1/3 left-10 text-blue-300 text-5xl opacity-20">
        <FaPills />
      </motion.div>
      <motion.div style={{ x: icon5X, y: icon5Y }} className="absolute top-2/3 left-1/4 text-blue-300 text-5xl opacity-20">
        <FaClinicMedical />
      </motion.div>

      <div className="relative z-10 p-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-6 text-blue-800"
        >
          Patient Dashboard
        </motion.h2>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8"
        >
          <StatCard icon={<FaUserMd />} label="Total Doctors" value={doctors.length} color="blue" />
          <StatCard icon={<FaCalendarCheck />} label="My Appointments" value={appointments.length} color="green" />
        </motion.div>

        {/* Top Rated Doctors */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Top Rated Doctors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRated.map((doc, index) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-blue-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Doctor Image */}
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-200">
                      <DoctorAvatar doctor={doc} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{doc.fullName}</h4>
                      <p className="text-sm text-gray-600">{doc.specialist?.join(', ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-sm font-medium">
                        {doc.averageRating ? doc.averageRating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">({doc.totalRatings || 0})</span>
                    </div>
                    <Link
                      to={`/patient/book-appointment?doctorId=${doc._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-blue-200"
        >
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Recent Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Doctor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Reason</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.slice(0, 5).map(apt => (
                    <tr key={apt._id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{apt.consultingDoctor}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{apt.appointmentReason}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${apt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {apt.status === 'Accepted' && (
                          <Link
                            to={`/patient/chats?appointment=${apt._id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Chat
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <p className="text-xs text-gray-400 mt-6 text-center">Made with DrapCode</p>
      </div>
    </div>
  );
};

// Reusable StatCard component (matches admin/doctor style)
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white/30 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientDashboard;