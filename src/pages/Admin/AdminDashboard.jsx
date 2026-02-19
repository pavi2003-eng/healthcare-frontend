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
  FaCalendarAlt,
  FaChartLine,
  FaStethoscope,
  FaSyringe,
  FaPills,
  FaClinicMedical
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());

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

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-blue-500 text-5xl"
        >
          <FaHeartbeat />
        </motion.div>
      </div>
    );
  }

  const {
    counts,
    riskCategories,
    upcomingAppointments,
    appointmentsByStatus,
    topPatients,
    topDoctors,
    riskTrend = [],
    highRiskAppointments = []
  } = data;

  // Prepare risk trend data for area chart
  const riskDates = riskTrend.map(r =>
    new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
  );
  const riskHigh = riskTrend.map(r => r.high);
  const riskModerate = riskTrend.map(r => r.moderate);
  const riskLow = riskTrend.map(r => r.low);

  // Options for wavy area chart (risk trend)
  const riskAreaOptions = {
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout' }
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
    xaxis: { categories: riskDates },
    legend: { position: 'top', horizontalAlign: 'center' },
    title: {
      text: 'Patient Risk Trend (Last 7 Days)',
      align: 'left',
      style: { fontSize: '18px', fontWeight: 600, color: '#1e3a8a' }
    },
    yaxis: { min: 0, forceNiceScale: true },
    tooltip: { shared: true, intersect: false }
  };
  const riskAreaSeries = [
    { name: 'High Risk', data: riskHigh },
    { name: 'Moderate Risk', data: riskModerate },
    { name: 'Low Risk', data: riskLow }
  ];

  // Status bar chart
  const statusBarOptions = {
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    colors: ['#f59e0b', '#10b981', '#6b7280', '#ef4444'],
    plotOptions: { bar: { distributed: true, horizontal: false, columnWidth: '55%' } },
    xaxis: { categories: ['Scheduled', 'Accepted', 'Completed', 'Cancelled'] },
    title: { text: 'Appointments by Status', align: 'left', style: { fontSize: '16px', fontWeight: 600, color: '#1e3a8a' } },
    dataLabels: { enabled: false },
    legend: { show: false }
  };
  const statusBarSeries = [{ name: 'Appointments', data: appointmentsByStatus }];

  // Top doctors (horizontal bar)
  const topDocsOptions = {
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    colors: ['#ec4899'],
    plotOptions: { bar: { horizontal: true, barHeight: '50%' } },
    xaxis: { categories: topDoctors.map(d => d.name) },
    title: { text: 'Top Doctors', align: 'left', style: { fontSize: '16px', fontWeight: 600, color: '#1e3a8a' } },
    dataLabels: { enabled: true }
  };
  const topDocsSeries = [{ name: 'Appointments', data: topDoctors.map(d => d.count) }];

  // Top patients (horizontal bar)
  const topPatientsOptions = {
    chart: { type: 'bar', height: 250, toolbar: { show: false } },
    colors: ['#8b5cf6'],
    plotOptions: { bar: { horizontal: true, barHeight: '50%' } },
    xaxis: { categories: topPatients.map(p => p.name) },
    title: { text: 'Top Patients', align: 'left', style: { fontSize: '16px', fontWeight: 600, color: '#1e3a8a' } },
    dataLabels: { enabled: true }
  };
  const topPatientsSeries = [{ name: 'Appointments', data: topPatients.map(p => p.count) }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white p-6">
      {/* Floating medical icons for visual interest (motion) */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-20 left-10 text-blue-200 text-6xl opacity-20"
      >
        <FaStethoscope />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute bottom-20 right-10 text-blue-200 text-7xl opacity-20"
      >
        <FaSyringe />
      </motion.div>
      <motion.div
        animate={{ x: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
        className="absolute top-1/3 right-20 text-blue-200 text-6xl opacity-20"
      >
        <FaPills />
      </motion.div>
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute bottom-1/3 left-10 text-blue-200 text-6xl opacity-20"
      >
        <FaClinicMedical />
      </motion.div>

      <div className="relative z-10">
{/* Header with date filter – now sticky */}
<div className="sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gradient-to-br from-blue-100 via-blue-50 to-white/90 backdrop-blur-sm py-4 px-2 rounded-b-lg shadow-sm">
  <h2 className="text-4xl font-bold text-blue-800 flex items-center gap-2">
    <FaChartLine className="text-blue-500" /> Analytics Dashboard
  </h2>
  <div className="flex items-center gap-2 mt-2 sm:mt-0 bg-white/60 backdrop-blur-sm p-2 rounded-lg shadow">
    <FaCalendarAlt className="text-blue-500" />
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      selectsStart
      startDate={startDate}
      endDate={endDate}
      className="border border-blue-200 rounded-lg px-3 py-1 bg-transparent"
      dateFormat="MMM d, yyyy"
    />
    <span className="text-blue-500">–</span>
    <DatePicker
      selected={endDate}
      onChange={(date) => setEndDate(date)}
      selectsEnd
      startDate={startDate}
      endDate={endDate}
      minDate={startDate}
      className="border border-blue-200 rounded-lg px-3 py-1 bg-transparent"
      dateFormat="MMM d, yyyy"
    />
  </div>
</div>

        {/* Stats cards with glass effect */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon={<FaUsers />} label="Total Users" value={counts.users} color="text-blue-700" />
          <StatCard icon={<FaUserMd />} label="Doctors" value={counts.doctors} color="text-blue-700" />
          <StatCard icon={<FaUserInjured />} label="Patients" value={counts.patients} color="text-blue-700" />
          <StatCard icon={<FaCalendarCheck />} label="Appointments" value={counts.appointments} color="text-blue-700" />
          <StatCard icon={<FaHeartbeat />} label="Critical" value={counts.criticalPatients} color="text-red-600" />
        </div>

        {/* Main chart grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk trend – full width (wavy area) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-blue-200"
          >
            <Chart options={riskAreaOptions} series={riskAreaSeries} type="area" height={320} />
          </motion.div>

          {/* Appointments by status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-blue-200"
          >
            <Chart options={statusBarOptions} series={statusBarSeries} type="bar" height={250} />
          </motion.div>

          {/* Top Doctors */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-blue-200"
          >
            {topDoctors.length > 0 ? (
              <Chart options={topDocsOptions} series={topDocsSeries} type="bar" height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">No data</div>
            )}
          </motion.div>

          {/* Top Patients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-blue-200"
          >
            {topPatients.length > 0 ? (
              <Chart options={topPatientsOptions} series={topPatientsSeries} type="bar" height={250} />
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">No data</div>
            )}
          </motion.div>

          {/* High‑Risk Appointments by Doctor (donut chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-blue-200"
          >
            <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
              <FaExclamationTriangle /> High‑Risk Appointments by Doctor
            </h3>
            {highRiskAppointments.length > 0 ? (
              (() => {
                // Aggregate by doctor
                const doctorMap = new Map();
                highRiskAppointments.forEach(apt => {
                  const doctor = apt.doctorName || 'Unknown';
                  doctorMap.set(doctor, (doctorMap.get(doctor) || 0) + 1);
                });
                const doctors = Array.from(doctorMap.keys());
                const counts = Array.from(doctorMap.values());

                const donutOptions = {
                  chart: { type: 'donut', height: 250, toolbar: { show: false } },
                  labels: doctors,
                  colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'],
                  legend: { position: 'bottom', fontSize: '12px' },
                  dataLabels: { enabled: false },
                  plotOptions: { pie: { donut: { size: '65%' } } },
                  responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
                };
                const donutSeries = counts;

                return <Chart options={donutOptions} series={donutSeries} type="donut" height={250} />;
              })()
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No high‑risk appointments in selected period
              </div>
            )}
          </motion.div>
        </div>

        {/* Upcoming appointments table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-blue-200"
        >
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Upcoming Appointments (Next 30 Days)</h3>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Patient</th>
                    <th className="px-4 py-2 text-left">Doctor</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map(apt => (
                    <tr key={apt._id} className="border-t">
                      <td className="px-4 py-2">{apt.patientId?.name || apt.patientName}</td>
                      <td className="px-4 py-2">{apt.doctorId?.fullName || apt.consultingDoctor}</td>
                      <td className="px-4 py-2">{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{apt.appointmentTime}</td>
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
        </motion.div>
      </div>
    </div>
  );
};

// Reusable glass stat card
const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/30 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50"
  >
    <div className="flex items-center gap-3">
      <div className="text-3xl text-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;