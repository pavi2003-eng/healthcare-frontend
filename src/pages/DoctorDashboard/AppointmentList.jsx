import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  FaCalendarAlt, FaClock, FaUser, FaCheck, FaRedo, FaEye, 
  FaFilter, FaSpinner, FaTimes, FaSearch, FaChevronDown,
  FaHeartbeat, FaTint, FaVenusMars
} from 'react-icons/fa';

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPatient, setFilterPatient] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Loading states for async actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Summary stats
  const [stats, setStats] = useState({
    today: 0,
    scheduled: 0,
    accepted: 0,
    completed: 0
  });

  // Reschedule modal state
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const computePriority = (bloodPressure, glucoseLevel) => {
    if (bloodPressure > 140 || glucoseLevel > 140) return 'High';
    if (bloodPressure > 120 || glucoseLevel > 100) return 'Moderate';
    return 'Low';
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await API.get(`/appointments/doctor/${user.doctorId}`);

        const appointmentsWithPriority = await Promise.all(
          res.data.map(async (apt) => {
            if (apt.patientPriority) return apt;
            try {
              const patientRes = await API.get(`/patients/${apt.patientId}`);
              const patient = patientRes.data;
              apt.patientPriority = computePriority(patient.bloodPressure, patient.glucoseLevel);
              apt.patientGender = patient.gender;
            } catch (err) {
              apt.patientPriority = 'Unknown';
              apt.patientGender = 'N/A';
            }
            return apt;
          })
        );

        setAppointments(appointmentsWithPriority);
        setFiltered(appointmentsWithPriority);

        const todayStr = new Date().toISOString().split('T')[0];
        const today = appointmentsWithPriority.filter(apt => apt.appointmentDate?.startsWith(todayStr)).length;
        const scheduled = appointmentsWithPriority.filter(apt => apt.status === 'Scheduled').length;
        const accepted = appointmentsWithPriority.filter(apt => apt.status === 'Accepted').length;
        const completed = appointmentsWithPriority.filter(apt => apt.status === 'Completed').length;
        setStats({ today, scheduled, accepted, completed });

      } catch (error) {
        console.error('Error fetching appointments:', error);
        Swal.fire({
          title: 'Error',
          text: 'Could not fetch appointments',
          icon: 'error',
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem'
        });
        setStats({ today: 3, scheduled: 8, accepted: 12, completed: 4 });
      } finally {
        setLoading(false);
      }
    };
    if (user?.doctorId) {
      fetchAppointments();
    }
  }, [user, isMobile]);

  useEffect(() => {
    let filteredApps = appointments;
    if (filterDate) {
      filteredApps = filteredApps.filter(apt => apt.appointmentDate?.includes(filterDate));
    }
    if (filterType) {
      filteredApps = filteredApps.filter(apt => apt.appointmentType === filterType);
    }
    if (filterPatient) {
      filteredApps = filteredApps.filter(apt => 
        apt.patientName?.toLowerCase().includes(filterPatient.toLowerCase())
      );
    }
    setFiltered(filteredApps);
  }, [filterDate, filterType, filterPatient, appointments]);

  const handleAccept = async (appointmentId) => {
    const result = await Swal.fire({
      title: 'Accept appointment?',
      text: 'This will notify the patient and create a chat.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, accept it!',
      background: isMobile ? '#fff' : undefined,
      width: isMobile ? '90%' : '32rem'
    });
    if (!result.isConfirmed) return;

    setActionLoading(true);
    setActionId(appointmentId);
    try {
      await API.patch(`/appointments/${appointmentId}/accept`);
      const res = await API.get(`/appointments/doctor/${user.doctorId}`);
      setAppointments(res.data);
      setFiltered(res.data);
      Swal.fire({
        title: 'Accepted!',
        text: 'Appointment accepted and patient notified.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
    } catch (error) {
      console.error('Accept failed:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to accept appointment.',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      Swal.fire({
        title: 'Error',
        text: 'Please select both date and time',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      return;
    }

    setActionLoading(true);
    try {
      await API.patch(`/appointments/${selectedAppointment._id}/reschedule`, {
        appointmentDate: newDate,
        appointmentTime: newTime
      });
      Swal.fire({
        title: 'Success',
        text: 'Appointment rescheduled',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      const res = await API.get(`/appointments/doctor/${user.doctorId}`);
      setAppointments(res.data);
      setFiltered(res.data);
      setShowReschedule(false);
    } catch (error) {
      console.error('Reschedule failed:', error);
      Swal.fire({
        title: 'Error',
        text: 'Reschedule failed',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 mb-3 sm:mb-0">
            My Appointments
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <FaFilter />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Stats Cards - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <StatCard 
            label={isMobile ? "Today" : "Today's"} 
            value={stats.today} 
            icon={<FaCalendarAlt />} 
            color="blue" 
            isMobile={isMobile}
          />
          <StatCard 
            label="Pending" 
            value={stats.scheduled} 
            icon={<FaClock />} 
            color="yellow" 
            isMobile={isMobile}
          />
          <StatCard 
            label="Accepted" 
            value={stats.accepted} 
            icon={<FaCheck />} 
            color="green" 
            isMobile={isMobile}
          />
          <StatCard 
            label="Completed" 
            value={stats.completed} 
            icon={<FaCheck />} 
            color="purple" 
            isMobile={isMobile}
          />
        </div>

        {/* Filter Bar - Responsive */}
        <div className={`bg-white rounded-lg shadow-md border border-blue-100 mb-4 sm:mb-6 overflow-hidden transition-all ${
          isMobile ? (showFilters ? 'block' : 'hidden') : 'block'
        }`}>
          <div className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder={isMobile ? "Filter by date" : "Filter by date (YYYY-MM-DD)"}
                  className="w-full border border-gray-200 rounded-lg pl-8 sm:pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <FaChevronDown className="absolute left-3 top-3 text-gray-400 text-sm" />
                <select
                  className="w-full border border-gray-200 rounded-lg pl-8 sm:pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none appearance-none bg-white"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <FaUser className="absolute left-3 top-3 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder={isMobile ? "Search patient" : "Filter by patient name"}
                  className="w-full border border-gray-200 rounded-lg pl-8 sm:pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                  value={filterPatient}
                  onChange={(e) => setFilterPatient(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments - Responsive Card/Table View */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          {isMobile ? (
            // Mobile Card View
            <div className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p>No appointments found</p>
                </div>
              ) : (
                filtered.map(apt => (
                  <div key={apt._id} className="p-4 hover:bg-blue-50 transition">
                    {/* Patient Info & Actions Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {apt.patientName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{apt.patientName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              apt.patientPriority === 'High' ? 'bg-red-100 text-red-700' :
                              apt.patientPriority === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {apt.patientPriority}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FaVenusMars /> {apt.patientGender || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => handleAccept(apt._id)}
                            disabled={actionLoading}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                            title="Accept"
                          >
                            {actionLoading && actionId === apt._id ? 
                              <FaSpinner className="animate-spin" size={14} /> : 
                              <FaCheck size={14} />
                            }
                          </button>
                        )}
                        {apt.status === 'Accepted' && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setNewDate(apt.appointmentDate?.split('T')[0]);
                              setNewTime(apt.appointmentTime);
                              setShowReschedule(true);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Reschedule"
                          >
                            <FaRedo size={14} />
                          </button>
                        )}
                        <Link
                          to={`/doctor/patients/${apt.patientId}`}
                          className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
                          title="View Patient"
                        >
                          <FaEye size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Appointment Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Date</span>
                        <p className="font-medium text-sm">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Time</span>
                        <p className="font-medium text-sm">{apt.appointmentTime}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Type</span>
                        <p className="font-medium text-sm">{apt.appointmentType}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Status</span>
                        <p className={`font-medium text-sm ${
                          apt.status === 'Accepted' ? 'text-green-600' :
                          apt.status === 'Scheduled' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {apt.status}
                        </p>
                      </div>
                    </div>

                    {/* Reason (if available) */}
                    {apt.appointmentReason && (
                      <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <span className="text-gray-500 text-xs">Reason:</span>
                        <p className="mt-1">{apt.appointmentReason}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(apt => (
                    <tr key={apt._id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {apt.patientName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{apt.patientName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {apt.patientPriority && (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            apt.patientPriority === 'High' ? 'bg-red-100 text-red-800' :
                            apt.patientPriority === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {apt.patientPriority}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {apt.patientGender || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{apt.appointmentTime}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {apt.appointmentReason || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {apt.appointmentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          apt.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          apt.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => handleAccept(apt._id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900 mr-3 disabled:opacity-50 transition"
                            title="Accept"
                          >
                            {actionLoading && actionId === apt._id ? 
                              <FaSpinner className="animate-spin" size={16} /> : 
                              <FaCheck size={16} />
                            }
                          </button>
                        )}
                        {apt.status === 'Accepted' && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setNewDate(apt.appointmentDate?.split('T')[0]);
                              setNewTime(apt.appointmentTime);
                              setShowReschedule(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3 transition"
                            title="Reschedule"
                          >
                            <FaRedo size={16} />
                          </button>
                        )}
                        <Link
                          to={`/doctor/patients/${apt.patientId}`}
                          className="text-purple-600 hover:text-purple-900 transition"
                          title="View Patient"
                        >
                          <FaEye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length === 0 && !isMobile && (
            <div className="text-center py-12 text-gray-500">
              <FaCalendarAlt className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-lg">No appointments found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Reschedule Modal - Responsive */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-800">Reschedule Appointment</h3>
              <button
                onClick={() => setShowReschedule(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                disabled={actionLoading}
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={actionLoading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={actionLoading}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowReschedule(false)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base order-2 sm:order-1"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Confirming...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive StatCard Component
const StatCard = ({ label, value, icon, color, isMobile }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-600',
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-blue-100 p-3 sm:p-4 hover:shadow-lg transition">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`rounded-full p-2 sm:p-3 ${colorClasses[color]}`}>
          <div className="text-xs sm:text-sm">{icon}</div>
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;