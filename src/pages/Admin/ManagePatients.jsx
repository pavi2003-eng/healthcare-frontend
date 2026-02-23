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
  FaClinicMedical,
  FaPhone,
  FaTint,
} from 'react-icons/fa';

const ManagePatients = () => {
  const containerRef = useRef(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
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
    if (isMobile) return; // Disable on mobile
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
      Swal.fire({
        title: 'Error',
        text: 'Could not fetch patients',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
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
      confirmButtonText: 'Yes, delete it!',
      background: isMobile ? '#fff' : undefined,
      width: isMobile ? '90%' : '32rem'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/admin/patients/${id}`);
        fetchPatients();
        Swal.fire({
          title: 'Deleted!',
          text: 'Patient has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem'
        });
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire({
          title: 'Error',
          text: 'Delete failed.',
          icon: 'error',
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem'
        });
      }
    }
  };

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
        <span className="text-blue-800 text-base sm:text-xl">Loading Patients...</span>
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
      {/* Floating icons - hidden on mobile */}
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

      <div className="relative z-10 p-4 sm:p-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-800"
        >
          Manage Patients
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-blue-200"
        >
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-3">
              {patients.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No patients found</p>
              ) : (
                patients.map((patient) => (
                  <motion.div
                    key={patient._id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-lg shadow-md border border-blue-100 p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {patient.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-800 text-base">{patient.name}</h3>
                          <p className="text-xs text-gray-600">{patient.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        title="Delete Patient"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-gray-500 flex items-center gap-1">
                          <FaCalendarAlt className="text-blue-400" /> Age:
                        </span>
                        <p className="font-medium">{patient.age || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-1">
                          <FaVenusMars className="text-blue-400" /> Gender:
                        </span>
                        <p className="font-medium">{patient.gender || 'N/A'}</p>
                      </div>
                      
                      {/* Additional patient info if available */}
                      {patient.contactNumber && (
                        <div className="col-span-2">
                          <span className="text-gray-500 flex items-center gap-1">
                            <FaPhone className="text-blue-400" /> Contact:
                          </span>
                          <p className="font-medium">{patient.contactNumber}</p>
                        </div>
                      )}
                      
                      {/* Health metrics if available */}
                      <div className="col-span-2 grid grid-cols-3 gap-2 mt-2">
                        {patient.bloodPressure && (
                          <div className="bg-blue-50 p-1 rounded text-center">
                            <FaHeartbeat className="text-red-400 mx-auto text-xs" />
                            <p className="text-[10px] text-gray-600">BP</p>
                            <p className="text-xs font-bold">{patient.bloodPressure}</p>
                          </div>
                        )}
                        {patient.glucoseLevel && (
                          <div className="bg-green-50 p-1 rounded text-center">
                            <FaTint className="text-green-400 mx-auto text-xs" />
                            <p className="text-[10px] text-gray-600">Glucose</p>
                            <p className="text-xs font-bold">{patient.glucoseLevel}</p>
                          </div>
                        )}
                        {patient.heartRate && (
                          <div className="bg-purple-50 p-1 rounded text-center">
                            <FaHeartbeat className="text-purple-400 mx-auto text-xs" />
                            <p className="text-[10px] text-gray-600">Heart</p>
                            <p className="text-xs font-bold">{patient.heartRate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUserInjured /> Name
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaEnvelope /> Email
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt /> Age
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaVenusMars /> Gender
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Health Metrics
                    </th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <motion.tr
                        key={patient._id}
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        className="transition"
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {patient.email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {patient.age || 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {patient.gender || 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {patient.contactNumber || 'N/A'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            {patient.bloodPressure && (
                              <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs" title="Blood Pressure">
                                BP: {patient.bloodPressure}
                              </span>
                            )}
                            {patient.glucoseLevel && (
                              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs" title="Glucose Level">
                                G: {patient.glucoseLevel}
                              </span>
                            )}
                            {patient.heartRate && (
                              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs" title="Heart Rate">
                                HR: {patient.heartRate}
                              </span>
                            )}
                            {!patient.bloodPressure && !patient.glucoseLevel && !patient.heartRate && 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <button
                            onClick={() => handleDelete(patient._id)}
                            className="text-red-600 hover:text-red-900 transition p-1 hover:bg-red-50 rounded-lg"
                            title="Delete Patient"
                          >
                            <FaTrash size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Patient count */}
          <div className="mt-4 text-xs sm:text-sm text-gray-500 border-t border-gray-200 pt-3">
            Total Patients: <span className="font-bold text-blue-600">{patients.length}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagePatients;