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
  FaArrowRight,
  FaClock
} from 'react-icons/fa';

// DoctorAvatar component with proper error handling
const DoctorAvatar = ({ doctor }) => {
  const [imageError, setImageError] = useState(false);

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';
  const getImageUrl = (profileImage) => {
    const baseURL = 'https://healthcare-backend-kj7h.onrender.com/';
    return profileImage ? `${baseURL}${profileImage}` : null;
  };

  const imageUrl = doctor.profileImage ? getImageUrl(doctor.profileImage) : null;

  if (!imageUrl || imageError) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
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
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
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

  // Mouse parallax animation
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
    if (isMobile) return;
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
      setLoading(true);
      try {
        const [docsRes, aptRes] = await Promise.all([
          API.get('/doctors'),
          API.get(`/appointments/patient/${user.patientId}`)
        ]);
        setDoctors(docsRes.data);
        setAppointments(aptRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const topRated = [...doctors]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-white"
    >
      {/* Floating Icons - hidden on mobile */}
      {!isMobile && (
        <>
          <motion.div style={{ x: icon1X, y: icon1Y }} className="absolute top-20 left-10 text-blue-300 text-5xl opacity-30 pointer-events-none">
            <FaHeartbeat />
          </motion.div>
          <motion.div style={{ x: icon2X, y: icon2Y }} className="absolute bottom-20 right-10 text-blue-300 text-6xl opacity-30 pointer-events-none">
            <FaStethoscope />
          </motion.div>
          <motion.div style={{ x: icon3X, y: icon3Y }} className="absolute top-1/3 right-20 text-blue-300 text-5xl opacity-20 pointer-events-none">
            <FaSyringe />
          </motion.div>
          <motion.div style={{ x: icon4X, y: icon4Y }} className="absolute bottom-1/3 left-10 text-blue-300 text-5xl opacity-20 pointer-events-none">
            <FaPills />
          </motion.div>
          <motion.div style={{ x: icon5X, y: icon5Y }} className="absolute top-2/3 left-1/4 text-blue-300 text-5xl opacity-20 pointer-events-none">
            <FaClinicMedical />
          </motion.div>
        </>
      )}

      <div className="relative z-10 p-3 sm:p-4 md:p-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-800"
        >
          Patient Dashboard
        </motion.h2>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <StatCard 
            icon={<FaUserMd />} 
            label={isMobile ? "Doctors" : "Total Doctors"} 
            value={doctors.length} 
            color="blue" 
            isMobile={isMobile}
          />
          <StatCard 
            icon={<FaCalendarCheck />} 
            label={isMobile ? "Appointments" : "My Appointments"} 
            value={appointments.length} 
            color="green" 
            isMobile={isMobile}
          />
        </motion.div>

        {/* Top Rated Doctors */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-blue-800 flex items-center gap-2">
            <FaStar className="text-yellow-500" /> 
            <span>Top Rated Doctors</span>
          </h3>
          
          {topRated.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No doctors available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {topRated.map((doc, index) => (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={!isMobile ? { y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
                  className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {/* Doctor Image */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-blue-200 flex-shrink-0">
                        <DoctorAvatar doctor={doc} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate">{doc.fullName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {Array.isArray(doc.specialist) ? doc.specialist.join(', ') : doc.specialist || 'General'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm font-medium">
                          {doc.averageRating ? doc.averageRating.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500">({doc.totalRatings || 0})</span>
                      </div>
                      <Link
                        to={`/patient/book-appointment?doctorId=${doc._id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition flex items-center gap-1"
                      >
                        <span>Book</span>
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-lg border border-blue-200"
        >
          <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-blue-800">
            {isMobile ? 'Upcoming' : 'Recent Appointments'}
          </h3>
          
          {appointments.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FaCalendarCheck className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No appointments yet.</p>
              <Link 
                to="/patient/doctors" 
                className="inline-block mt-3 text-blue-600 text-sm hover:underline"
              >
                Browse Doctors
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left font-medium text-blue-700">Date</th>
                        <th className="px-2 sm:px-4 py-2 text-left font-medium text-blue-700">Doctor</th>
                        <th className="px-2 sm:px-4 py-2 text-left font-medium text-blue-700 hidden sm:table-cell">Reason</th>
                        <th className="px-2 sm:px-4 py-2 text-left font-medium text-blue-700">Status</th>
                        <th className="px-2 sm:px-4 py-2 text-left font-medium text-blue-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {upcomingAppointments.map(apt => (
                        <tr key={apt._id} className="hover:bg-blue-50/50 transition">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <FaClock className="text-gray-400 text-xs hidden sm:block" />
                              <span className="text-gray-900 text-xs sm:text-sm">
                                {new Date(apt.appointmentDate).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-gray-600 text-xs sm:text-sm">
                            {apt.consultingDoctor || 'Dr. Unknown'}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm hidden sm:table-cell max-w-[150px] truncate">
                            {apt.appointmentReason || 'Consultation'}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap ${
                              apt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                              apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {isMobile ? apt.status.slice(0, 3) : apt.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                            {apt.status === 'Accepted' && (
                              <Link
                                to={`/patient/chats?appointment=${apt._id}`}
                                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                              >
                                Chat
                              </Link>
                            )}
                            {apt.status === 'Scheduled' && (
                              <Link
                                to={`/patient/update-appointment/${apt._id}`}
                                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                              >
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {appointments.length > 5 && (
                    <div className="mt-3 text-center">
                      <Link 
                        to="/patient/appointments" 
                        className="text-blue-600 text-xs sm:text-sm hover:underline inline-flex items-center gap-1"
                      >
                        View all appointments
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center"
        >
          <Link
            to="/patient/doctors"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition flex items-center gap-2 shadow-md"
          >
            <FaUserMd /> Find Doctors
          </Link>
          <Link
            to="/patient/appointments"
            className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition flex items-center gap-2 shadow-md"
          >
            <FaCalendarCheck /> My Appointments
          </Link>
        </motion.div>

        <p className="text-[10px] sm:text-xs text-gray-400 mt-4 sm:mt-6 text-center">Made with DrapCode</p>
      </div>
    </div>
  );
};

// Reusable StatCard component with responsive design
const StatCard = ({ icon, label, value, color, isMobile }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <motion.div
      whileHover={!isMobile ? { scale: 1.05, y: -5 } : {}}
      className="bg-white/30 backdrop-blur-md p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-white/50"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`rounded-full p-2 sm:p-3 ${colorClasses[color]}`}>
          <div className="text-sm sm:text-base">{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
          <p className={`text-xl sm:text-2xl md:text-3xl font-bold text-${color}-700`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientDashboard;