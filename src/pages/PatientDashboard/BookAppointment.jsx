import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaStethoscope, 
  FaUserMd, 
  FaNotesMedical, 
  FaHeartbeat, 
  FaTint, 
  FaArrowLeft,
  FaSpinner,
  FaInfoCircle
} from 'react-icons/fa';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    appointmentReason: '',
    appointmentType: 'Consultation',
    consultingDoctor: '',
    consultingDoctorId: doctorId || '',
    notes: '',
    bloodPressure: '',
    glucoseLevel: '',
    heartRate: ''
  });
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await API.get(`/patients/${user.patientId}`);
        setPatient(res.data);
        setFormData(prev => ({
          ...prev,
          bloodPressure: res.data.bloodPressure || '',
          glucoseLevel: res.data.glucoseLevel || '',
          heartRate: res.data.heartRate || ''
        }));
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    };
    if (user?.patientId) fetchPatient();
  }, [user]);

  const fetchDoctor = async () => {
    try {
      const res = await API.get(`/doctors/${doctorId}`);
      setDoctor(res.data);
      setFormData(prev => ({ ...prev, consultingDoctor: res.data.fullName }));
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      patientName: user.name,
      patientEmail: user.email,
      patientGender: patient?.gender || 'Not specified',
      patientAge: patient?.age || 0,
      patientId: user.patientId,
      doctorId: doctorId || formData.consultingDoctorId,
      consultingDoctor: formData.consultingDoctor,
      status: 'Scheduled',
      bloodPressure: formData.bloodPressure ? Number(formData.bloodPressure) : undefined,
      glucoseLevel: formData.glucoseLevel ? Number(formData.glucoseLevel) : undefined,
      heartRate: formData.heartRate ? Number(formData.heartRate) : undefined
    };

    try {
      await API.post('/appointments', payload);
      Swal.fire({
        title: 'Success!',
        text: 'Appointment booked successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Booking failed:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Booking failed. Please try again.',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-3 sm:p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <FaArrowLeft className="mr-2 text-sm sm:text-base" /> Back
        </motion.button>

        {/* Header */}
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 mb-4 sm:mb-6"
        >
          Book Appointment
        </motion.h2>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl shadow-2xl border border-blue-200"
        >
          {/* Doctor Info (if selected) */}
          {doctor && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                  {doctor.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-blue-800 text-sm sm:text-base">Dr. {doctor.fullName}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {Array.isArray(doctor.specialist) ? doctor.specialist.join(', ') : doctor.specialist || 'General'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={today}
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm sm:text-base"
                  required
                />
              </div>
              <div className="relative">
                <FaClock className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Type & Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <FaStethoscope className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm sm:text-base appearance-none"
                >
                  <option>Consultation</option>
                  <option>Follow-up</option>
                  <option>Procedure</option>
                </select>
              </div>
              <div className="relative">
                <FaUserMd className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                <input
                  type="text"
                  name="consultingDoctor"
                  value={formData.consultingDoctor}
                  onChange={handleChange}
                  placeholder="Doctor name"
                  className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm sm:text-base"
                  required
                  readOnly={!!doctorId}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="relative">
              <FaNotesMedical className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
              <input
                type="text"
                name="appointmentReason"
                value={formData.appointmentReason}
                onChange={handleChange}
                placeholder="Reason for appointment"
                className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm sm:text-base"
                required
              />
            </div>

            {/* Notes */}
            <div className="relative">
              <textarea
                name="notes"
                rows={isMobile ? 2 : 3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes (optional)"
                className="w-full border border-blue-200 p-2 sm:p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm sm:text-base resize-none"
              />
            </div>

            {/* Vitals Section */}
            <div className="border-t border-blue-200 pt-3 sm:pt-4">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center gap-2">
                <FaHeartbeat className="text-red-400" /> 
                Current Vitals
                <span className="text-xs font-normal text-gray-500">(optional)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Blood Pressure */}
                <div className="relative">
                  <FaHeartbeat className="absolute left-3 top-3 text-blue-400 text-sm" />
                  <input
                    type="number"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    placeholder="BP (systolic)"
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm"
                    min="0"
                  />
                </div>

                {/* Glucose Level */}
                <div className="relative">
                  <FaTint className="absolute left-3 top-3 text-blue-400 text-sm" />
                  <input
                    type="number"
                    name="glucoseLevel"
                    value={formData.glucoseLevel}
                    onChange={handleChange}
                    placeholder="Glucose (mg/dL)"
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm"
                    min="0"
                  />
                </div>

                {/* Heart Rate */}
                <div className="relative">
                  <FaHeartbeat className="absolute left-3 top-3 text-blue-400 text-sm" />
                  <input
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                    placeholder="Heart Rate (bpm)"
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 text-sm"
                    min="0"
                  />
                </div>
              </div>

              {/* Vitals Info Note */}
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <FaInfoCircle className="text-blue-400" />
                Your previous vitals have been auto-filled. You can update them if needed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
              <motion.button
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border border-blue-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm sm:text-base"
                disabled={loading}
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  'Book Appointment'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          * Appointment requests will be reviewed by the doctor
        </p>
      </div>
    </div>
  );
};

export default BookAppointment;