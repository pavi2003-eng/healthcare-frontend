import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaFilter, 
  FaUserMd, 
  FaPhoneAlt, 
  FaVenusMars, 
  FaSearch,
  FaTimes,
  FaChevronDown
} from 'react-icons/fa';

// Helper to build correct image URL
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
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg">
        {doctor.fullName?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={doctor.fullName}
      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-blue-200"
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
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const headerRef = useRef(null);

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
        d.fullName?.toLowerCase().includes(searchName.toLowerCase())
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

  const clearFilters = () => {
    setSearchName('');
    setSpecialty('');
    setGender('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white">
      {/* Sticky Header */}
      <div
        ref={headerRef}
        className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800"
            >
              Available Doctors
            </motion.h2>
            
            {/* Mobile Filter Toggle */}
            {isMobile && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                <FaFilter />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <FaChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Filter Bar - Responsive */}
          <AnimatePresence>
            {(!isMobile || showFilters) && (
              <motion.div
                initial={isMobile ? { height: 0, opacity: 0 } : { opacity: 0, y: 20 }}
                animate={isMobile ? { height: 'auto', opacity: 1 } : { opacity: 1, y: 0 }}
                exit={isMobile ? { height: 0, opacity: 0 } : {}}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                  {/* Search by Name */}
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search by doctor name..."
                      className="w-full bg-white border border-blue-200 rounded-lg pl-8 sm:pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>

                  {/* Filter by Specialty */}
                  <div className="flex-1 relative">
                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Filter by specialty..."
                      className="w-full bg-white border border-blue-200 rounded-lg pl-8 sm:pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    />
                  </div>

                  {/* Gender Filter */}
                  <select
                    className="w-full sm:w-auto bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>

                  {/* Clear Filters Button */}
                  {(searchName || specialty || gender) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-sm px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition"
                    >
                      <FaTimes />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="mt-3 text-xs sm:text-sm text-gray-500">
            Showing {filtered.length} of {doctors.length} doctors
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white/50 rounded-xl"
          >
            <FaUserMd className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">No doctors match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((doc, index) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!isMobile ? { y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' } : {}}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-blue-200 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-4 sm:p-5">
                  {/* Doctor Header */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <DoctorAvatar doctor={doc} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base sm:text-lg truncate">
                        {doc.fullName}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {Array.isArray(doc.specialist) ? doc.specialist.join(', ') : doc.specialist || 'General'}
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-xs sm:text-sm ${
                            i < Math.round(doc.averageRating || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">
                      {doc.totalRatings > 0 ? (
                        <>
                          {doc.averageRating?.toFixed(1)} ({doc.totalRatings})
                        </>
                      ) : (
                        'No ratings'
                      )}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                      <FaVenusMars className="text-blue-400 flex-shrink-0" />
                      <span className="truncate">{doc.gender || 'Not specified'}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                      <FaPhoneAlt className="text-blue-400 flex-shrink-0" />
                      <span className="truncate">{doc.contactNumber || doc.mobileNumber || 'N/A'}</span>
                    </p>
                  </div>

                  {/* Book Button */}
                  <Link
                    to={`/patient/book-appointment?doctorId=${doc._id}`}
                    className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg text-sm sm:text-base transition shadow-md hover:shadow-lg"
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