import React, { useEffect, useState, useRef } from 'react';
import API from '../../api';
import Swal from 'sweetalert2';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  FaUserMd,
  FaEnvelope,
  FaLock,
  FaVenusMars,
  FaPhone,
  FaStethoscope,
  FaIdCard,
  FaHeartbeat,
  FaSyringe,
  FaPills,
  FaClinicMedical,
  FaEdit,
  FaTrash,
  FaStar,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const ManageDoctors = () => {
  const containerRef = useRef(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', gender: 'Male',
    contactNumber: '', specialist: '', designation: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Mouse position (normalized -1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform values for floating icons
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
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/admin/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Swal.fire('Error', 'Could not fetch doctors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const specialistArray = formData.specialist
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    const payload = {
      ...formData,
      specialist: specialistArray
    };

    if (editingId && !payload.password) {
      delete payload.password;
    }

    try {
      if (editingId) {
        await API.put(`/admin/doctors/${editingId}`, payload);
        Swal.fire('Updated!', 'Doctor updated successfully.', 'success');
      } else {
        await API.post('/admin/doctors', payload);
        Swal.fire('Created!', 'Doctor created successfully.', 'success');
      }
      fetchDoctors();
      resetForm();
    } catch (error) {
      console.error('Save failed:', error);
      Swal.fire('Error', 'Operation failed.', 'error');
    }
  };

  const handleEdit = (doc) => {
    let specialistStr = '';
    if (Array.isArray(doc.specialist)) {
      specialistStr = doc.specialist.join(', ');
    } else if (typeof doc.specialist === 'string') {
      specialistStr = doc.specialist;
    }

    setFormData({
      fullName: doc.fullName || '',
      email: doc.email || '',
      password: '',
      gender: doc.gender || 'Male',
      contactNumber: doc.contactNumber || '',
      specialist: specialistStr,
      designation: doc.designation || ''
    });
    setEditingId(doc._id);
    setShowForm(true);
    setShowPassword(false);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this doctor!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/admin/doctors/${id}`);
        fetchDoctors();
        Swal.fire('Deleted!', 'Doctor has been deleted.', 'success');
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire('Error', 'Delete failed.', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', email: '', password: '', gender: 'Male',
      contactNumber: '', specialist: '', designation: ''
    });
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
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
        <span className="text-blue-800 text-xl">Loading Doctors...</span>
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
      {/* Floating pastel icons */}
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

      {/* Main content */}
      <div className="relative z-10 p-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-6 text-blue-800"
        >
           Manage Doctors
        </motion.h2>

        {/* Add Doctor Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            if (!showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="mb-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-blue-700 transition shadow-lg font-semibold"
        >
          {showForm ? ' Cancel' : ' Add New Doctor'}
        </motion.button>

        {/* Form Card */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl mb-6 max-w-3xl border border-blue-200"
          >
            <h3 className="text-2xl font-bold mb-4 text-blue-700">
              {editingId ? '✏️ Edit Doctor' : '➕ Add New Doctor'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="relative">
                  <FaUserMd className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Full Name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!editingId}
                    className={`w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 ${
                      editingId ? 'bg-blue-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 pl-10 pr-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder={editingId ? 'Leave blank to keep unchanged' : 'Password'}
                    required={!editingId}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-blue-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {/* Gender */}
                <div className="relative">
                  <FaVenusMars className="absolute left-3 top-3 text-blue-400" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition bg-white text-gray-900"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Contact Number */}
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Contact Number"
                    required
                  />
                </div>

                {/* Specialist */}
                <div className="relative">
                  <FaStethoscope className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="text"
                    name="specialist"
                    value={formData.specialist}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Specialist (comma separated)"
                  />
                </div>

                {/* Designation */}
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-3 text-blue-400" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Designation"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-white px-6 py-2 rounded-xl hover:bg-gray-500 transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-2 rounded-xl hover:from-green-500 hover:to-green-700 transition shadow-lg font-semibold"
                >
                  {editingId ? 'Update Doctor' : 'Create Doctor'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Doctors Table */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-2xl overflow-x-auto border border-blue-200"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Specialist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {doctors.map((doc) => {
                let specialistDisplay = '';
                if (Array.isArray(doc.specialist)) {
                  specialistDisplay = doc.specialist.join(', ');
                } else if (typeof doc.specialist === 'string') {
                  specialistDisplay = doc.specialist;
                }

                return (
                  <motion.tr
                    key={doc._id}
                    whileHover={{ scale: 1.01, backgroundColor: '#f0f9ff' }}
                    className="transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.contactNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{specialistDisplay}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span>{doc.averageRating ? doc.averageRating.toFixed(1) : 'N/A'}</span>
                        <span className="text-xs text-gray-400 ml-1">({doc.totalRatings || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(doc)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Delete"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default ManageDoctors;