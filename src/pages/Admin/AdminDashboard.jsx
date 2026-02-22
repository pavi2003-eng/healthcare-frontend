import React, { useEffect, useState } from 'react';
import API from '../../api';
import Chart from 'react-apexcharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaUserMd,
  FaUserInjured,
  FaCalendarCheck,
  FaHeartbeat,
  FaExclamationTriangle,
  FaChartLine,
  FaStethoscope,
  FaSyringe,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';  // Fixed import
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setChartKey(prev => prev + 1);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, highRiskRes] = await Promise.all([
        API.get('/admin/dashboard-data', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }),
        API.get('/admin/high-risk-appointments', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      ]);
      setData({ ...dashboardRes.data, highRiskAppointments: highRiskRes.data });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    // Check if user is admin
    const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
    if (userFromStorage?.role !== 'admin' && user?.role !== 'admin') {
      Swal.fire({
        title: 'Access Denied',
        text: 'Only administrators can perform this action.',
        icon: 'error',
        timer: 3000,
        showConfirmButton: true
      });
      return;
    }

    const result = await Swal.fire({
      title: '⚠️ DANGER ZONE ⚠️',
      html: `
        <div class="text-left">
          <p class="mb-3 font-bold text-red-600">This will PERMANENTLY DELETE:</p>
          <ul class="list-disc pl-5 mb-3 text-sm">
            <li>✓ All patients</li>
            <li>✓ All doctors</li>
            <li>✓ All appointments</li>
            <li>✓ All chats</li>
            <li>✓ All ratings</li>
            <li>✓ All non-admin users</li>
          </ul>
          <p class="text-sm text-gray-600">Admin accounts will be preserved.</p>
          <p class="text-xs text-red-500 mt-2">This action CANNOT be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete everything!',
      cancelButtonText: 'Cancel',
      background: isMobile ? '#fff' : undefined,
      width: isMobile ? '90%' : '32rem',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setCleaning(true);
    try {
      // Call the cleanup API
      const response = await API.get('/admin/nuke-all-data');
      
      Swal.fire({
        title: '✅ Cleanup Complete',
        html: `
          <div class="text-left">
            <p class="mb-2">Successfully deleted:</p>
            <ul class="list-disc pl-5 text-sm">
              <li>${response.data.stats?.ratingsDeleted || 0} ratings</li>
              <li>${response.data.stats?.chatsDeleted || 0} chats</li>
              <li>${response.data.stats?.appointmentsDeleted || 0} appointments</li>
              <li>${response.data.stats?.patientsDeleted || 0} patients</li>
              <li>${response.data.stats?.doctorsDeleted || 0} doctors</li>
              <li>${response.data.stats?.nonAdminUsersDeleted || 0} non-admin users</li>
            </ul>
            <p class="mt-2 font-bold text-green-600">${response.data.adminUsersRemaining || 0} admin accounts preserved</p>
          </div>
        `,
        icon: 'success',
        timer: 5000,
        timerProgressBar: true
      });
      
      // Refresh dashboard data
      fetchData();
    } catch (error) {
      console.error('Cleanup failed:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Cleanup failed. Please try again.',
        icon: 'error'
      });
    } finally {
      setCleaning(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-blue-500 text-4xl sm:text-5xl"
        >
          <FaHeartbeat />
        </motion.div>
      </div>
    );
  }

  const {
    counts,
    upcomingAppointments,
    appointmentsByStatus = [0, 0, 0, 0],
    topPatients = [],
    topDoctors = [],
    riskTrend = [],
    highRiskAppointments = []
  } = data;

  // Prepare risk trend data
  const riskDates = riskTrend.length > 0 
    ? riskTrend.map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const riskHigh = riskTrend.length > 0 ? riskTrend.map(r => r.high) : [2, 3, 1, 4, 2, 3, 2];
  const riskModerate = riskTrend.length > 0 ? riskTrend.map(r => r.moderate) : [3, 4, 2, 5, 3, 4, 3];
  const riskLow = riskTrend.length > 0 ? riskTrend.map(r => r.low) : [5, 6, 4, 7, 5, 6, 5];

  // Risk Area Chart Options
  const riskAreaOptions = {
    chart: {
      type: 'area',
      height: isMobile ? 280 : 350,
      toolbar: { show: false },
      animations: { enabled: true },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#ef4444', '#f59e0b', '#10b981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    xaxis: { 
      categories: riskDates,
      labels: { 
        style: { fontSize: isMobile ? '10px' : '12px' },
        rotate: 0
      },
      axisBorder: { show: true },
      axisTicks: { show: true }
    },
    yaxis: { 
      min: 0,
      labels: { 
        style: { fontSize: isMobile ? '10px' : '12px' }
      }
    },
    legend: { 
      position: 'top', 
      horizontalAlign: 'center',
      fontSize: isMobile ? '12px' : '14px',
      markers: { width: 12, height: 12 }
    },
    title: {
      text: 'Patient Risk Trend',
      align: 'left',
      style: { fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#1e3a8a' }
    },
    grid: { show: true, borderColor: '#e2e8f0', strokeDashArray: 0 },
    tooltip: { enabled: true, theme: 'light' }
  };

  const riskAreaSeries = [
    { name: 'High Risk', data: riskHigh },
    { name: 'Moderate Risk', data: riskModerate },
    { name: 'Low Risk', data: riskLow }
  ];

  // Status Bar Chart Options
  const statusBarOptions = {
    chart: { 
      type: 'bar', 
      height: isMobile ? 220 : 280, 
      toolbar: { show: false },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    colors: ['#f59e0b', '#10b981', '#6b7280', '#ef4444'],
    plotOptions: { 
      bar: { 
        distributed: true, 
        horizontal: false, 
        columnWidth: isMobile ? '70%' : '60%',
        borderRadius: 4
      } 
    },
    xaxis: { 
      categories: ['Scheduled', 'Accepted', 'Completed', 'Cancelled'],
      labels: { 
        style: { fontSize: isMobile ? '10px' : '12px' },
        rotate: 0
      }
    },
    yaxis: { 
      labels: { style: { fontSize: isMobile ? '10px' : '12px' } }
    },
    title: { 
      text: 'Appointments by Status', 
      align: 'left', 
      style: { fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#1e3a8a' } 
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: { show: true, borderColor: '#e2e8f0' }
  };

  const statusBarSeries = [{ name: 'Appointments', data: appointmentsByStatus }];

  // Top Doctors Chart Options
  const topDocsOptions = {
    chart: { 
      type: 'bar', 
      height: isMobile ? 220 : 280, 
      toolbar: { show: false },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    colors: ['#ec4899'],
    plotOptions: { 
      bar: { 
        horizontal: true, 
        barHeight: '60%',
        borderRadius: 4
      } 
    },
    xaxis: { 
      categories: topDoctors.length > 0 ? topDoctors.map(d => d.name) : ['Dr. Smith', 'Dr. Jones'],
      labels: { style: { fontSize: isMobile ? '10px' : '12px' } }
    },
    yaxis: { 
      labels: { style: { fontSize: isMobile ? '10px' : '12px' } }
    },
    title: { 
      text: 'Top Doctors', 
      align: 'left', 
      style: { fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#1e3a8a' } 
    },
    dataLabels: { enabled: false },
    grid: { show: true, borderColor: '#e2e8f0' }
  };

  const topDocsSeries = [{ 
    name: 'Appointments', 
    data: topDoctors.length > 0 ? topDoctors.map(d => d.count) : [5, 3] 
  }];

  // Top Patients Chart Options
  const topPatientsOptions = {
    chart: { 
      type: 'bar', 
      height: isMobile ? 220 : 280, 
      toolbar: { show: false },
      fontFamily: 'inherit',
      background: 'transparent'
    },
    colors: ['#8b5cf6'],
    plotOptions: { 
      bar: { 
        horizontal: true, 
        barHeight: '60%',
        borderRadius: 4
      } 
    },
    xaxis: { 
      categories: topPatients.length > 0 ? topPatients.map(p => p.name) : ['John Doe', 'Jane Smith'],
      labels: { style: { fontSize: isMobile ? '10px' : '12px' } }
    },
    yaxis: { 
      labels: { style: { fontSize: isMobile ? '10px' : '12px' } }
    },
    title: { 
      text: 'Top Patients', 
      align: 'left', 
      style: { fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#1e3a8a' } 
    },
    dataLabels: { enabled: false },
    grid: { show: true, borderColor: '#e2e8f0' }
  };

  const topPatientsSeries = [{ 
    name: 'Appointments', 
    data: topPatients.length > 0 ? topPatients.map(p => p.count) : [4, 2] 
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white p-4 sm:p-6 relative">
      {/* Floating icons - hidden on mobile */}
      {!isMobile && (
        <>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="fixed top-20 left-10 text-blue-200 text-6xl opacity-20 pointer-events-none">
            <FaStethoscope />
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="fixed bottom-20 right-10 text-blue-200 text-7xl opacity-20 pointer-events-none">
            <FaSyringe />
          </motion.div>
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with date filter and cleanup button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 flex items-center gap-2 mb-3 sm:mb-0">
            <FaChartLine className="text-blue-500" /> Analytics Dashboard
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-blue-100">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="border border-blue-200 rounded-lg px-3 py-1.5 text-sm w-28 sm:w-32"
                dateFormat="MMM d, yyyy"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="border border-blue-200 rounded-lg px-3 py-1.5 text-sm w-28 sm:w-32"
                dateFormat="MMM d, yyyy"
              />
            </div>
            
            {/* Cleanup Button - Only visible to admins */}
            {(user?.role === 'admin' || JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCleanup}
                disabled={cleaning}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {cleaning ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Clear All Data
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <StatCard icon={<FaUsers />} label="Total Users" value={counts?.users || 0} color="text-blue-700" />
          <StatCard icon={<FaUserMd />} label="Doctors" value={counts?.doctors || 0} color="text-blue-700" />
          <StatCard icon={<FaUserInjured />} label="Patients" value={counts?.patients || 0} color="text-blue-700" />
          <StatCard icon={<FaCalendarCheck />} label="Appointments" value={counts?.appointments || 0} color="text-blue-700" />
          <StatCard icon={<FaHeartbeat />} label="Critical" value={counts?.criticalPatients || 0} color="text-red-600" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Risk Trend - Full width */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="w-full h-[280px] sm:h-[350px]">
              <Chart key={`risk-${chartKey}`} options={riskAreaOptions} series={riskAreaSeries} type="area" height="100%" />
            </div>
          </div>

          {/* Appointments by Status */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="w-full h-[220px] sm:h-[280px]">
              <Chart key={`status-${chartKey}`} options={statusBarOptions} series={statusBarSeries} type="bar" height="100%" />
            </div>
          </div>

          {/* Top Doctors */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="w-full h-[220px] sm:h-[280px]">
              {topDoctors.length > 0 ? (
                <Chart key={`docs-${chartKey}`} options={topDocsOptions} series={topDocsSeries} type="bar" height="100%" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No doctor data</div>
              )}
            </div>
          </div>

          {/* Top Patients */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="w-full h-[220px] sm:h-[280px]">
              {topPatients.length > 0 ? (
                <Chart key={`patients-${chartKey}`} options={topPatientsOptions} series={topPatientsSeries} type="bar" height="100%" />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No patient data</div>
              )}
            </div>
          </div>

          {/* High Risk Donut */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
            <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
              <FaExclamationTriangle /> High-Risk by Doctor
            </h3>
            <div className="w-full h-[220px] sm:h-[280px]">
              {highRiskAppointments.length > 0 ? (
                (() => {
                  const doctorMap = new Map();
                  highRiskAppointments.forEach(apt => {
                    const doctor = apt.doctorName || 'Unknown';
                    doctorMap.set(doctor, (doctorMap.get(doctor) || 0) + 1);
                  });
                  
                  const donutOptions = {
                    chart: { 
                      type: 'donut', 
                      height: '100%',
                      toolbar: { show: false },
                      fontFamily: 'inherit'
                    },
                    labels: Array.from(doctorMap.keys()),
                    colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'],
                    legend: { 
                      position: 'bottom', 
                      fontSize: isMobile ? '10px' : '12px',
                      itemMargin: { vertical: 5 }
                    },
                    dataLabels: { enabled: false },
                    plotOptions: { 
                      pie: { 
                        donut: { 
                          size: '65%',
                          labels: { show: false }
                        } 
                      } 
                    },
                    responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }]
                  };
                  
                  return (
                    <Chart 
                      key={`donut-${chartKey}`} 
                      options={donutOptions} 
                      series={Array.from(doctorMap.values())} 
                      type="donut" 
                      height="100%" 
                    />
                  );
                })()
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No high-risk appointments</div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4 border border-blue-100">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Upcoming Appointments</h3>
          {upcomingAppointments?.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Patient</th>
                    <th className="px-4 py-2 text-left">Doctor</th>
                    <th className="px-4 py-2 text-left hidden md:table-cell">Date</th>
                    <th className="px-4 py-2 text-left hidden md:table-cell">Time</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(upcomingAppointments || []).slice(0, 5).map(apt => (
                    <tr key={apt._id} className="border-t hover:bg-blue-50/50">
                      <td className="px-4 py-2">{apt.patientId?.name || apt.patientName}</td>
                      <td className="px-4 py-2">{apt.doctorId?.fullName || apt.consultingDoctor}</td>
                      <td className="px-4 py-2 hidden md:table-cell">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 hidden md:table-cell">{apt.appointmentTime}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-md border border-blue-100"
  >
    <div className="flex items-center gap-3">
      <div className="text-2xl sm:text-3xl text-blue-600">{icon}</div>
      <div>
        <p className="text-xs sm:text-sm text-gray-600">{label}</p>
        <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;