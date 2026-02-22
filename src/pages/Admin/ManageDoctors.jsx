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
  FaEyeSlash,
  FaPlus,
  FaTimes,
  FaMobile
} from 'react-icons/fa';

const ManageDoctors = () => {
  const containerRef = useRef(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', 
    email: '', 
    mobileNumber: '', // Added mobile number field
    password: '', 
    gender: 'Male',
    contactNumber: '', 
    specialist: '', 
    designation: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/admin/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      Swal.fire({
        title: 'Error',
        text: 'Could not fetch doctors',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle mobile number validation
    if (name === 'mobileNumber') {
      // Only allow digits and limit to 10 characters
      const formattedValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mobile number
    if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a valid 10-digit mobile number',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      return;
    }

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
        Swal.fire({
          title: 'Updated!',
          text: 'Doctor updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem'
        });
      } else {
        await API.post('/admin/doctors', payload);
        Swal.fire({
          title: 'Created!',
          text: 'Doctor created successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: isMobile ? '#fff' : undefined,
          width: isMobile ? '90%' : '32rem'
        });
      }
      fetchDoctors();
      resetForm();
    } catch (error) {
      console.error('Save failed:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Operation failed.',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
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
      mobileNumber: doc.mobileNumber || doc.contactNumber || '', // Use mobileNumber if available, fallback to contactNumber
      password: '',
      gender: doc.gender || 'Male',
      contactNumber: doc.contactNumber || '',
      specialist: specialistStr,
      designation: doc.designation || ''
    });
    setEditingId(doc._id);
    setShowForm(true);
    setShowPassword(false);
    // Scroll to form on mobile
    if (isMobile) {
      setTimeout(() => {
        document.getElementById('doctor-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this doctor!',
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
        await API.delete(`/admin/doctors/${id}`);
        fetchDoctors();
        Swal.fire({
          title: 'Deleted!',
          text: 'Doctor has been deleted.',
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

  const resetForm = () => {
    setFormData({
      fullName: '', 
      email: '', 
      mobileNumber: '',
      password: '', 
      gender: 'Male',
      contactNumber: '', 
      specialist: '', 
      designation: ''
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
          className="mr-3 text-3xl sm:text-4xl text-blue-500"
        >
          <FaHeartbeat />
        </motion.div>
        <span className="text-blue-800 text-base sm:text-xl">Loading Doctors...</span>
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
      {/* Floating pastel icons - hidden on mobile */}
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

      {/* Main content */}
      <div className="relative z-10 p-4 sm:p-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-blue-800"
        >
          Manage Doctors
        </motion.h2>

        {/* Add Doctor Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={!isMobile ? { scale: 1.05 } : {}}
          onClick={() => {
            if (!showForm) resetForm();
            setShowForm(!showForm);
          }}
          className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-500 hover:to-blue-700 transition shadow-lg font-semibold text-sm sm:text-base flex items-center gap-2"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? ' Cancel' : ' Add New Doctor'}
        </motion.button>

        {/* Form Card */}
        {showForm && (
          <motion.div
            id="doctor-form"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl mb-6 max-w-3xl border border-blue-200"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-blue-700">
              {editingId ? 'Edit Doctor' : ' Add New Doctor'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Full Name */}
                <div className="relative">
                  <FaUserMd className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Full Name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!editingId}
                    className={`w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
                      editingId ? 'bg-blue-50 cursor-not-allowed' : 'bg-white'
                    }`}
                    placeholder="Email"
                    required
                  />
                </div>

                {/* Mobile Number - NEW */}
                <div className="relative">
                  <FaMobile className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Mobile Number (10 digits)"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="Please enter a valid 10-digit mobile number"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 pr-8 sm:pr-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder={editingId ? 'Leave blank to keep unchanged' : 'Password'}
                    required={!editingId}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-2.5 sm:top-3 cursor-pointer text-blue-400"
                  >
                    {showPassword ? <FaEyeSlash size={isMobile ? 16 : 18} /> : <FaEye size={isMobile ? 16 : 18} />}
                  </span>
                </div>

                {/* Gender */}
                <div className="relative">
                  <FaVenusMars className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition bg-white text-gray-900 text-sm sm:text-base appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Contact Number (for backward compatibility) */}
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Contact Number (optional)"
                  />
                </div>

                {/* Specialist */}
                <div className="relative">
                  <FaStethoscope className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    name="specialist"
                    value={formData.specialist}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Specialist (comma separated)"
                  />
                </div>

                {/* Designation */}
                <div className="relative">
                  <FaIdCard className="absolute left-3 top-3 text-blue-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 sm:p-2.5 pl-8 sm:pl-10 rounded-xl focus:ring-2 focus:ring-blue-300 outline-none transition text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                    placeholder="Designation"
                  />
                </div>
              </div>

              {/* Mobile number validation hint */}
              {formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber) && (
                <p className="text-xs text-red-500 mt-2">
                  Please enter a valid 10-digit mobile number
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-xl hover:bg-gray-500 transition text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={!isMobile ? { scale: 1.02 } : {}}
                  type="submit"
                  className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 sm:px-6 py-2 rounded-xl hover:from-green-500 hover:to-green-700 transition shadow-lg font-semibold text-sm sm:text-base order-1 sm:order-2 mb-2 sm:mb-0"
                >
                  {editingId ? 'Update Doctor' : 'Create Doctor'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Doctors Table - Responsive Card View on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl border border-blue-200"
        >
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-3">
              {doctors.map((doc) => {
                let specialistDisplay = '';
                if (Array.isArray(doc.specialist)) {
                  specialistDisplay = doc.specialist.join(', ');
                } else if (typeof doc.specialist === 'string') {
                  specialistDisplay = doc.specialist;
                }

                return (
                  <motion.div
                    key={doc._id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-lg shadow-md border border-blue-100 p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-blue-800 text-base">{doc.fullName}</h3>
                        <p className="text-xs text-gray-600">{doc.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <p className="font-medium">{doc.gender}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Mobile:</span>
                        <p className="font-medium">{doc.mobileNumber || doc.contactNumber || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Specialist:</span>
                        <p className="font-medium truncate">{specialistDisplay}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Rating:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <FaStar className="text-yellow-400 text-xs" />
                          <span className="font-medium">{doc.averageRating ? doc.averageRating.toFixed(1) : 'N/A'}</span>
                          <span className="text-gray-400 text-xs ml-1">({doc.totalRatings || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {doctors.length === 0 && (
                <p className="text-center text-gray-500 py-4">No doctors found</p>
              )}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Name</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Email</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Mobile</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Gender</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Specialist</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Rating</th>
                    <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
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
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        className="transition"
                      >
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{doc.fullName}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{doc.email}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{doc.mobileNumber || doc.contactNumber || 'N/A'}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{doc.gender}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 max-w-[150px] truncate">{specialistDisplay}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                            <span>{doc.averageRating ? doc.averageRating.toFixed(1) : 'N/A'}</span>
                            <span className="text-xs text-gray-400 ml-1">({doc.totalRatings || 0})</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <button
                            onClick={() => handleEdit(doc)}
                            className="text-blue-600 hover:text-blue-900 mr-3 sm:mr-4 transition"
                            title="Edit"
                          >
                            <FaEdit size={isMobile ? 16 : 18} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="text-red-600 hover:text-red-900 transition"
                            title="Delete"
                          >
                            <FaTrash size={isMobile ? 16 : 18} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageDoctors;