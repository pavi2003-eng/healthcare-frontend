import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaStethoscope, FaUserMd, FaNotesMedical, FaHeartbeat, FaTint, FaArrowLeft } from 'react-icons/fa';

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
      Swal.fire('Success!', 'Appointment booked successfully!', 'success');
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Booking failed:', error);
      Swal.fire('Error', 'Booking failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back
        </motion.button>

        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-blue-800 mb-6"
        >
          Book Appointment
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-blue-200"
        >
          {doctor && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-800">Doctor: {doctor.fullName}</p>
              <p className="text-sm text-gray-600">Specialty: {doctor.specialist?.join(', ')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-3 text-blue-400" />
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                  required
                />
              </div>
              <div className="relative">
                <FaClock className="absolute left-3 top-3 text-blue-400" />
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                  required
                />
              </div>
            </div>

            {/* Type & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FaStethoscope className="absolute left-3 top-3 text-blue-400" />
                <select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 appearance-none"
                >
                  <option>Consultation</option>
                  <option>Follow-up</option>
                  <option>Procedure</option>
                </select>
              </div>
              <div className="relative">
                <FaUserMd className="absolute left-3 top-3 text-blue-400" />
                <input
                  type="text"
                  name="consultingDoctor"
                  value={formData.consultingDoctor}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                  required
                  readOnly={!!doctorId}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="relative">
              <FaNotesMedical className="absolute left-3 top-3 text-blue-400" />
              <input
                type="text"
                name="appointmentReason"
                value={formData.appointmentReason}
                onChange={handleChange}
                placeholder="Reason for appointment"
                className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                required
              />
            </div>

            {/* Notes */}
            <div className="relative">
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes (optional)"
                className="w-full border border-blue-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
              ></textarea>
            </div>

            {/* Vitals Section */}
            <div className="border-t border-blue-200 pt-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Current Vitals (optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <FaHeartbeat className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="number"
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleChange}
                    placeholder="Blood Pressure (systolic)"
                    className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                  />
                </div>
                <div className="relative">
                  <FaTint className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="number"
                    name="glucoseLevel"
                    value={formData.glucoseLevel}
                    onChange={handleChange}
                    placeholder="Glucose Level (mg/dL)"
                    className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                  />
                </div>
                <div className="relative">
                  <FaHeartbeat className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                    placeholder="Heart Rate (bpm)"
                    className="w-full border border-blue-200 p-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-blue-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Booking...
                  </>
                ) : (
                  'Book Appointment'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookAppointment;