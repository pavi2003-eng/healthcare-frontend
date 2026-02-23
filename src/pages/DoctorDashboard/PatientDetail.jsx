import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import Swal from 'sweetalert2';
import { 
  FaArrowLeft, 
  FaUserCircle, 
  FaHeartbeat, 
  FaTint, 
  FaClock, 
  FaCalendarAlt, 
  FaCheckCircle,
  FaVenusMars,
  FaNotesMedical,
  FaSpinner,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';

const getPriorityClass = (priority) => {
  switch(priority) {
    case 'High': return 'bg-red-100 text-red-800 border border-red-200';
    case 'Moderate': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    default: return 'bg-green-100 text-green-800 border border-green-200';
  }
};

const computePriority = (bloodPressure, glucoseLevel) => {
  if (bloodPressure > 140 || glucoseLevel > 140) return 'High';
  if (bloodPressure > 120 || glucoseLevel > 100) return 'Moderate';
  return 'Low';
};

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
    const fetchData = async () => {
      try {
        // Fetch patient details
        const patientRes = await API.get(`/patients/${patientId}`);
        setPatient(patientRes.data);

        // Fetch appointments for this patient
        const aptRes = await API.get(`/appointments/patient/${patientId}`);
        if (aptRes.data && aptRes.data.length > 0) {
          const activeAppointment = aptRes.data.find(apt => apt.status !== 'Completed');
          setAppointment(activeAppointment || aptRes.data[0]);
        } else {
          setAppointment(null);
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
        Swal.fire({
          title: 'Error',
          text: 'Could not load patient details',
          icon: 'error',
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem'
        });
        // Fallback sample data for development
        setPatient({
          name: 'April Gilbert',
          age: 22,
          gender: 'Female',
          bloodPressure: 120,
          glucoseLevel: 100,
          heartRate: 80,
          email: 'april.gilbert@example.com',
          mobileNumber: '9876543210'
        });
        setAppointment({
          _id: 'sample-id',
          patientName: 'April Gilbert',
          patientGender: 'Female',
          patientAge: 22,
          appointmentType: 'Consultation',
          appointmentReason: 'Skin allergies - acne',
          appointmentDate: '2024-08-12',
          appointmentTime: '19:00',
          notes: 'Blood Pressure: 120/80, Pulse: 80, Temperature: 37, SPO2: 92',
          status: 'Accepted'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, isMobile]);

  const handleComplete = async () => {
    if (!appointment?._id) {
      Swal.fire({
        title: 'Error',
        text: 'No appointment selected to complete.',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      return;
    }
    
    const result = await Swal.fire({
      title: 'Mark as completed?',
      text: 'This will change the appointment status to Completed.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, complete it!',
      background: isMobile ? '#fff' : undefined,
      width: isMobile ? '90%' : '32rem'
    });
    
    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      await API.patch(`/appointments/${appointment._id}/complete`);
      Swal.fire({
        title: 'Completed!',
        text: 'Appointment has been marked as completed.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      // Refresh appointments
      const aptRes = await API.get(`/appointments/patient/${patientId}`);
      if (aptRes.data.length > 0) {
        const activeAppointment = aptRes.data.find(apt => apt.status !== 'Completed');
        setAppointment(activeAppointment || aptRes.data[0]);
      }
    } catch (error) {
      console.error('Complete failed:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to complete appointment.',
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
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  const priority = patient ? computePriority(patient.bloodPressure, patient.glucoseLevel) : null;
  const displayName = patient?.name || appointment?.patientName || 'Unknown';
  const displayGender = patient?.gender || appointment?.patientGender || 'Not specified';
  const displayAge = patient?.age || appointment?.patientAge || 'N/A';
  const displayBloodPressure = patient?.bloodPressure;
  const displayGlucose = patient?.glucoseLevel;
  const displayHeartRate = patient?.heartRate;
  const displayEmail = patient?.email;
  const displayMobile = patient?.mobileNumber;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition mr-3 sm:mr-4 p-2 hover:bg-blue-50 rounded-lg"
          >
            <FaArrowLeft className="mr-1 sm:mr-2 text-sm sm:text-base" /> 
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-800">Patient Details</h2>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          {/* Patient header with avatar and basic info */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar - centered on mobile */}
              <div className="flex justify-center sm:justify-start">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* Patient info - stacked on mobile */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{displayName}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4">
                  <span className="flex items-center text-sm sm:text-base text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                    <FaVenusMars className="mr-1 sm:mr-2 text-blue-500" /> {displayGender}
                  </span>
                  <span className="flex items-center text-sm sm:text-base text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                    <FaClock className="mr-1 sm:mr-2 text-blue-500" /> Age: {displayAge}
                  </span>
                  {priority && (
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getPriorityClass(priority)}`}>
                      Priority: {priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info (if available) */}
          {(displayEmail || displayMobile) && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                {displayEmail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaEnvelope className="mr-2 text-blue-500" />
                    <span className="truncate">{displayEmail}</span>
                  </div>
                )}
                {displayMobile && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-2 text-blue-500" />
                    <span>{displayMobile}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Two-column layout for vitals and appointment */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Vitals Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center text-blue-700">
                <FaHeartbeat className="text-red-500 mr-2 text-lg" /> Vitals
              </h4>
              <div className="space-y-3">
                <VitalRow 
                  label="Blood Pressure" 
                  value={displayBloodPressure ? `${displayBloodPressure} mmHg` : 'N/A'}
                  icon={<FaHeartbeat className="text-red-400" />}
                />
                <VitalRow 
                  label="Glucose Level" 
                  value={displayGlucose ? `${displayGlucose} mg/dL` : 'N/A'}
                  icon={<FaTint className="text-blue-400" />}
                />
                <VitalRow 
                  label="Heart Rate" 
                  value={displayHeartRate ? `${displayHeartRate} bpm` : 'N/A'}
                  icon={<FaHeartbeat className="text-purple-400" />}
                />
              </div>
            </div>

            {/* Current Appointment Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 flex items-center text-blue-700">
                <FaCalendarAlt className="text-blue-500 mr-2 text-lg" /> Current Appointment
              </h4>
              {appointment ? (
                <div className="space-y-3">
                  <AppointmentRow 
                    label="Type" 
                    value={appointment.appointmentType}
                  />
                  <AppointmentRow 
                    label="Reason" 
                    value={appointment.appointmentReason}
                    className="break-words"
                  />
                  <AppointmentRow 
                    label="Date" 
                    value={new Date(appointment.appointmentDate).toLocaleDateString()}
                  />
                  <AppointmentRow 
                    label="Time" 
                    value={appointment.appointmentTime}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600 mb-1 sm:mb-0">Status</span>
                    <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium inline-block text-center ${
                      appointment.status === 'Accepted' ? 'bg-green-100 text-green-800 border border-green-200' :
                      appointment.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCalendarAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No current appointment</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {appointment?.notes && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 sm:p-5 border border-blue-200">
                <h4 className="font-semibold text-base sm:text-lg mb-2 flex items-center text-blue-700">
                  <FaNotesMedical className="mr-2 text-blue-500" /> Notes / Vitals Details
                </h4>
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/doctor/book-appointment')}
              className="bg-green-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
            >
              <FaCalendarAlt /> New Appointment
            </button>
            {appointment && appointment.status !== 'Completed' && (
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Mark as Completed
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Vital Row Component
const VitalRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
    <span className="flex items-center text-sm sm:text-base text-gray-600">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </span>
    <span className="font-medium text-sm sm:text-base bg-white px-3 py-1 rounded-full shadow-sm">
      {value}
    </span>
  </div>
);

// Reusable Appointment Row Component
const AppointmentRow = ({ label, value, className = '' }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 last:border-0">
    <span className="text-sm text-gray-600 mb-1 sm:mb-0">{label}</span>
    <span className={`font-medium text-sm sm:text-base bg-white px-3 py-1 rounded-full shadow-sm ${className}`}>
      {value}
    </span>
  </div>
);

export default PatientDetail;