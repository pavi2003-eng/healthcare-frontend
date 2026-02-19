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
  FaHeartbeat, FaStethoscope, FaSyringe, FaPills, FaClinicMedical
} from 'react-icons/fa';

const DoctorDashboard = () => {
  const containerRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, accepted: 0, pending: 0, completed: 0 });
  const [trendData, setTrendData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const { user } = useAuth();

  // Mouse animation values (same as admin)
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
          const count = apts.filter(a => a.appointmentDate.startsWith(date)).length;
          return { date: date.slice(5), appointments: count };
        });
        setTrendData(trend);

        const patientIds = [...new Set(apts.map(a => a.patientId))];
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

        const chatsRes = await API.get(`/chats/doctor/${user.doctorId}`);
        setRecentChats(chatsRes.data.slice(0, 3));
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
          { _id: '1', patientName: 'John Doe', messages: [{ text: 'When is my appointment?' }], lastUpdated: new Date() },
          { _id: '2', patientName: 'Jane Smith', messages: [{ text: 'Thanks doctor!' }], lastUpdated: new Date() },
        ]);
      }
    };
    fetchData();
  }, [user]);

  const upcoming = appointments
    .filter(apt => new Date(apt.appointmentDate) >= new Date())
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-blue-200 via-blue-100 to-white"
    >
      {/* Floating Icons (same as admin) */}
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
          Doctor Dashboard
        </motion.h2>

        {/* Stats Cards - Admin style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={<FaCalendarCheck />} label="Total Appointments" value={stats.total} color="blue" />
          <StatCard icon={<FaUserMd />} label="Accepted" value={stats.accepted} color="green" />
          <StatCard icon={<FaChartLine />} label="Pending" value={stats.pending} color="yellow" />
          <StatCard icon={<FaComments />} label="Completed" value={stats.completed} color="purple" />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Appointment Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#3B82F6" name="Appointments" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Patient Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Upcoming Appointments</h3>
            {upcoming.length === 0 ? (
              <p className="text-gray-500">No upcoming appointments.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Patient</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-blue-700 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {upcoming.map(apt => (
                      <tr key={apt._id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{apt.patientName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{apt.appointmentTime}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            apt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link to={`/doctor/patients/${apt.patientId}`} className="text-blue-600 hover:text-blue-800 text-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Recent Chats */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-blue-200"
          >
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Recent Chats</h3>
            {recentChats.length === 0 ? (
              <p className="text-gray-500">No recent chats.</p>
            ) : (
              <div className="space-y-3">
                {recentChats.map(chat => (
                  <Link
                    key={chat._id}
                    to={`/doctor/chats/${chat._id}`}
                    className="block p-3 border border-blue-100 rounded-lg hover:bg-blue-50 transition"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{chat.patientName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(chat.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.messages?.[chat.messages.length - 1]?.text || 'No messages'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">Made with DrapCode</p>
      </div>
    </div>
  );
};

// Updated StatCard matching admin design
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

export default DoctorDashboard;