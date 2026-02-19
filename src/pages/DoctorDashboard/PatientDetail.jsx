import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaUserCircle, FaHeartbeat, FaTint, FaClock, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const getPriorityClass = (priority) => {
  switch(priority) {
    case 'High': return 'bg-red-100 text-red-800';
    case 'Moderate': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-green-100 text-green-800';
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
        Swal.fire('Error', 'Could not load patient details', 'error');
        // Fallback sample data for development
        setPatient({
          name: 'April Gilbert',
          age: 22,
          gender: 'Female',
          bloodPressure: 120,
          glucoseLevel: 100,
          heartRate: 80
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
  }, [patientId]);

  const handleComplete = async () => {
    if (!appointment?._id) {
      Swal.fire('Error', 'No appointment selected to complete.', 'error');
      return;
    }
    const result = await Swal.fire({
      title: 'Mark as completed?',
      text: 'This will change the appointment status to Completed.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, complete it!'
    });
    if (!result.isConfirmed) return;

    try {
      await API.patch(`/appointments/${appointment._id}/complete`);
      Swal.fire('Completed!', 'Appointment has been marked as completed.', 'success');
      // Refresh appointments
      const aptRes = await API.get(`/appointments/patient/${patientId}`);
      if (aptRes.data.length > 0) {
        const activeAppointment = aptRes.data.find(apt => apt.status !== 'Completed');
        setAppointment(activeAppointment || aptRes.data[0]);
      }
    } catch (error) {
      console.error('Complete failed:', error);
      Swal.fire('Error', 'Failed to complete appointment.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
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

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 transition mr-4"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <h2 className="text-2xl font-semibold">Patient Details</h2>
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Patient header with avatar and basic info */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
              {displayName.charAt(0)}
            </div>
            <div className="ml-6">
              <h3 className="text-2xl font-bold text-gray-800">{displayName}</h3>
              <div className="flex items-center mt-2 space-x-4 text-gray-600">
                <span className="flex items-center"><FaUserCircle className="mr-2" /> {displayGender}</span>
                <span className="flex items-center"><FaClock className="mr-2" /> Age: {displayAge}</span>
                {priority && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClass(priority)}`}>
                    Priority: {priority}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout for vitals and appointment */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vitals Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-4 flex items-center">
              <FaHeartbeat className="text-red-500 mr-2" /> Vitals
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Blood Pressure</span>
                <span className="font-medium">{displayBloodPressure ? `${displayBloodPressure} mmHg` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">Glucose Level</span>
                <span className="font-medium">{displayGlucose ? `${displayGlucose} mg/dL` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Heart Rate</span>
                <span className="font-medium">{displayHeartRate ? `${displayHeartRate} bpm` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Current Appointment Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-4 flex items-center">
              <FaCalendarAlt className="text-blue-500 mr-2" /> Current Appointment
            </h4>
            {appointment ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{appointment.appointmentType}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Reason</span>
                  <span className="font-medium">{appointment.appointmentReason}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{appointment.appointmentTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No current appointment</p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {appointment?.notes && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Notes / Vitals Details</h4>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/doctor/book-appointment')}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
          >
            <FaCalendarAlt className="mr-2" /> New Appointment
          </button>
          {appointment && appointment.status !== 'Completed' && (
            <button
              onClick={handleComplete}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FaCheckCircle className="mr-2" /> Mark as Completed
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">Made with DrapCode</p>
    </div>
  );
};

export default PatientDetail;