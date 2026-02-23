import React, { useEffect, useState, useRef } from 'react';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  FaComments, FaCalendarCheck, FaUserMd, FaChartLine,
  FaHeartbeat, FaStethoscope, FaSyringe, FaPills, FaClinicMedical,
  FaSpinner
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const containerRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, accepted: 0, pending: 0, completed: 0 });
  const [trendData, setTrendData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
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

  // Mouse animation values
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

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const aptRes = await API.get(`/appointments/doctor/${user.doctorId}`);
        const apts = aptRes.data;
        setAppointments(apts);

        const total = apts.length;
        const accepted = apts.filter(a => a.status === 'Accepted').length;
        const pending = apts.filter(a => a.status === 'Scheduled').length;
        const completed = apts.filter(a => a.status === 'Completed').length;
        setStats({ total, accepted, pending, completed });

        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const trend = last7Days.map(date => {
          const count = apts.filter(a => a.appointmentDate?.startsWith(date)).length;
          return { date: date.slice(5), appointments: count };
        });
        setTrendData(trend);

        const patientIds = [...new Set(apts.map(a => a.patientId).filter(id => id))];
        const priorities = { High: 0, Moderate: 0, Low: 0 };
        
        await Promise.all(patientIds.map(async (pid) => {
          try {
            const res = await API.get(`/patients/${pid}`);
            const patient = res.data;
            const bp = patient.bloodPressure || 0;
            const glucose = patient.glucoseLevel || 0;
            if (bp > 140 || glucose > 140) priorities.High++;
            else if (bp > 120 || glucose > 100) priorities.Moderate++;
            else priorities.Low++;
          } catch (err) {
            console.error('Error fetching patient', pid);
          }
        }));
        
        setPriorityData([
          { name: 'High', value: priorities.High, color: '#ef4444' },
          { name: 'Moderate', value: priorities.Moderate, color: '#f59e0b' },
          { name: 'Low', value: priorities.Low, color: '#10b981' },
        ]);

        try {
          const chatsRes = await API.get(`/chats/doctor/${user.doctorId}`);
          console.log('Chats data:', chatsRes.data); // Debug log
          setRecentChats(chatsRes.data.slice(0, 3));
        } catch (err) {
          console.error('Error fetching chats:', err);
          setRecentChats([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback mock data
        setStats({ total: 24, accepted: 12, pending: 8, completed: 4 });
        setTrendData([
          { date: '04-10', appointments: 3 },
          { date: '04-11', appointments: 5 },
          { date: '04-12', appointments: 2 },
          { date: '04-13', appointments: 7 },
          { date: '04-14', appointments: 4 },
          { date: '04-15', appointments: 6 },
          { date: '04-16', appointments: 5 },
        ]);
        setPriorityData([
          { name: 'High', value: 5, color: '#ef4444' },
          { name: 'Moderate', value: 8, color: '#f59e0b' },
          { name: 'Low', value: 11, color: '#10b981' },
        ]);
        setRecentChats([
          { _id: '1', patientName: 'John Doe', lastMessage: { text: 'When is my appointment?', createdAt: new Date() }, lastMessageAt: new Date() },
          { _id: '2', patientName: 'Jane Smith', lastMessage: { text: 'Thanks doctor!', createdAt: new Date() }, lastMessageAt: new Date() },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.doctorId) {
      fetchData();
    }
  }, [user]);

  const upcoming = appointments
    .filter(apt => apt.appointmentDate && new Date(apt.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="mr-3 text-3xl sm:text-4xl text-blue-500"
        >
          <FaHeartbeat />
        </motion.div>
        <span className="text-blue-800 text-base sm:text-xl">Loading Dashboard...</span>
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
          Doctor Dashboard
        </motion.h2>

        {/* Stats Cards - Responsive grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8"
        >
          <StatCard icon={<FaCalendarCheck />} label="Total" value={stats.total} color="blue" isMobile={isMobile} />
          <StatCard icon={<FaUserMd />} label="Accepted" value={stats.accepted} color="green" isMobile={isMobile} />
          <StatCard icon={<FaChartLine />} label="Pending" value={stats.pending} color="yellow" isMobile={isMobile} />
          <StatCard icon={<FaComments />} label="Completed" value={stats.completed} color="purple" isMobile={isMobile} />
        </motion.div>

        {/* Charts Row - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Appointment Trend Chart */}
          <motion.div
            initial={{ x: isMobile ? 0 : -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-blue-800">
              {isMobile ? 'Appointment Trend' : 'Appointment Trend (Last 7 Days)'}
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  interval={isMobile ? 1 : 0}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                {!isMobile && <Legend />}
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#3B82F6" 
                  name="Appointments"
                  dot={{ r: isMobile ? 2 : 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Priority Distribution Chart */}
          <motion.div
            initial={{ x: isMobile ? 0 : 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-blue-800">
              {isMobile ? 'Patient Priority' : 'Patient Priority Distribution'}
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={!isMobile}
                  outerRadius={isMobile ? 60 : 80}
                  dataKey="value"
                  label={!isMobile ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : undefined}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                {isMobile && (
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom Section - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-blue-800">
              Upcoming Appointments
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No upcoming appointments.</p>
            ) : (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-1 sm:py-2 text-left font-medium text-blue-700">Patient</th>
                          <th className="px-2 sm:px-4 py-1 sm:py-2 text-left font-medium text-blue-700 hidden sm:table-cell">Date</th>
                          <th className="px-2 sm:px-4 py-1 sm:py-2 text-left font-medium text-blue-700 hidden sm:table-cell">Time</th>
                          <th className="px-2 sm:px-4 py-1 sm:py-2 text-left font-medium text-blue-700">Status</th>
                          <th className="px-2 sm:px-4 py-1 sm:py-2 text-left font-medium text-blue-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {upcoming.map(apt => (
                          <tr key={apt._id}>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-900 truncate max-w-[80px] sm:max-w-none">
                              {apt.patientName}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 hidden sm:table-cell">
                              {new Date(apt.appointmentDate).toLocaleDateString()}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 hidden sm:table-cell">
                              {apt.appointmentTime}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap ${
                                apt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {isMobile ? apt.status.slice(0, 3) : apt.status}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <Link 
                                to={`/doctor/patients/${apt.patientId}`} 
                                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                              >
                                {isMobile ? 'View' : 'View Details'}
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent Chats - FIXED DATE ISSUE */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-blue-800">
              Recent Chats
            </h3>
            {recentChats.length === 0 ? (
              <p className="text-gray-500 text-sm sm:text-base">No recent chats.</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentChats.map(chat => {
                  // Get the correct timestamp
                  const timestamp = chat.lastMessage?.createdAt || chat.lastMessageAt || chat.createdAt;
                  const lastMessageText = chat.lastMessage?.text || 'No messages yet';
                  
                  return (
                    <Link
                      key={chat._id}
                      to={`/doctor/chats/${chat._id}`}
                      className="block p-2 sm:p-3 border border-blue-100 rounded-lg hover:bg-blue-50 transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                          {chat.patientName}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400">
                          {formatDate(timestamp)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {lastMessageText}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="inline-block mt-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                          {chat.unreadCount} new
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Updated StatCard with responsive design
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
      className="bg-white/30 backdrop-blur-md p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-white/50"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`rounded-full p-1.5 sm:p-2 md:p-3 ${colorClasses[color]}`}>
          <div className="text-xs sm:text-sm md:text-base">{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-600 truncate">{label}</p>
          <p className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-${color}-700 truncate`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;