import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { motion } from 'framer-motion';
import { FaStar, FaFilter, FaUserMd, FaPhoneAlt, FaVenusMars, FaSearch } from 'react-icons/fa';

// Helper to build correct image URL (same as PatientDashboard)
const getImageUrl = (profileImage) => {
  if (!profileImage) return null;
  const apiBase = process.env.REACT_APP_API_URL || 'https://healthcare-backend-kj7h.onrender.com/api';
  const staticBase = apiBase.replace(/\/api$/, '');
  return `${staticBase}${profileImage}`;
};

// DoctorAvatar component with fallback
const DoctorAvatar = ({ doctor }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = doctor.profileImage ? getImageUrl(doctor.profileImage) : null;

  if (!imageUrl || imageError) {
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
        {doctor.fullName?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={doctor.fullName}
      className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
      onError={() => setImageError(true)}
    />
  );
};

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await API.get('/doctors');
        setDoctors(res.data);
        setFiltered(res.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filteredDocs = doctors;

    // Filter by name
    if (searchName) {
      filteredDocs = filteredDocs.filter(d =>
        d.fullName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by specialty
    if (specialty) {
      filteredDocs = filteredDocs.filter(d =>
        d.specialist?.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    // Filter by gender
    if (gender) {
      filteredDocs = filteredDocs.filter(d => d.gender === gender);
    }

    setFiltered(filteredDocs);
  }, [searchName, specialty, gender, doctors]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-blue-500 text-4xl"
        >
          <FaUserMd />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white">
      {/* Sticky Header with Title and Filters */}
      <div
        ref={headerRef}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto p-6">
          <motion.h2
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold text-blue-800 mb-4"
          >
            Available Doctors
          </motion.h2>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white/50 border border-blue-200 rounded-lg px-3 py-1">
              <FaSearch className="text-blue-400" />
              <input
                type="text"
                placeholder="Search by doctor name..."
                className="w-full bg-transparent border-none focus:outline-none"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white/50 border border-blue-200 rounded-lg px-3 py-1">
              <FaFilter className="text-blue-400" />
              <input
                type="text"
                placeholder="Filter by specialty..."
                className="w-full bg-transparent border-none focus:outline-none"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 min-w-[150px]"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </motion.div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No doctors match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((doc, index) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-blue-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <DoctorAvatar doctor={doc} />
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{doc.fullName}</h3>
                      <p className="text-sm text-gray-600">{doc.specialist?.join(', ')}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < Math.round(doc.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {doc.totalRatings > 0 ? (
                        <>
                          {doc.averageRating?.toFixed(1)} ({doc.totalRatings} {doc.totalRatings === 1 ? 'review' : 'reviews'})
                        </>
                      ) : (
                        'No ratings yet'
                      )}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <FaVenusMars className="text-blue-400" /> {doc.gender}
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <FaPhoneAlt className="text-blue-400" /> {doc.contactNumber}
                    </p>
                  </div>

                  {/* Book Button */}
                  <Link
                    to={`/patient/book-appointment?doctorId=${doc._id}`}
                    className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition shadow-md"
                  >
                    Book Appointment
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;