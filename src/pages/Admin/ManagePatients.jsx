import React, { useEffect, useState, useRef } from 'react';
import API from '../../api';
import Swal from 'sweetalert2';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  FaUserInjured,
  FaEnvelope,
  FaCalendarAlt,
  FaVenusMars,
  FaTrash,
  FaHeartbeat,
  FaStethoscope,
  FaSyringe,
  FaPills,
  FaClinicMedical
} from 'react-icons/fa';

const ManagePatients = () => {
  const containerRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await API.get('/admin/patients');
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Swal.fire('Error', 'Could not fetch patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this patient!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/admin/patients/${id}`);
        fetchPatients();
        Swal.fire('Deleted!', 'Patient has been deleted.', 'success');
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire('Error', 'Delete failed.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="mr-3 text-4xl text-blue-500"
        >
          <FaHeartbeat />
        </motion.div>
        <span className="text-blue-800 text-xl">Loading Patients...</span>
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
          Manage Patients
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl overflow-x-auto border border-blue-200"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaUserInjured /> Name
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaEnvelope /> Email
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt /> Age
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FaVenusMars /> Gender
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <motion.tr
                  key={patient._id}
                  whileHover={{ scale: 1.01, backgroundColor: '#f0f9ff' }}
                  className="transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {patient.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.age || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.gender || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(patient._id)}
                      className="text-red-600 hover:text-red-900 transition"
                      title="Delete Patient"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagePatients;