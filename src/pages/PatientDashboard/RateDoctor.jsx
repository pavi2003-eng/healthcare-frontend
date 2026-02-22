import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { motion } from 'framer-motion';
import { FaStar, FaArrowLeft, FaUserMd, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Helper for image URL
const getImageUrl = (profileImage) => {
  if (!profileImage) return null;
  const apiBase = process.env.REACT_APP_API_URL || 'https://healthcare-backend-kj7h.onrender.com/api';
  const staticBase = apiBase.replace(/\/api$/, '');
  return `${staticBase}${profileImage}`;
};

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

const RateDoctor = () => {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment');
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
    const fetchDoctor = async () => {
      try {
        const res = await API.get(`/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      Swal.fire({
        title: 'Rating required',
        text: 'Please select a star rating.',
        icon: 'warning',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      return;
    }

    setSubmitting(true);

    try {
      await API.post('/ratings', {
        doctorId,
        appointmentId,
        score: rating,
        comment
      });

      await API.post('/fix-all-ratings');

      Swal.fire({
        title: 'Thank you!',
        text: 'Your rating has been submitted.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Rating submission failed:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to submit rating. You may have already rated this appointment.',
        icon: 'error',
        background: isMobile ? '#fff' : undefined,
        width: isMobile ? '90%' : '32rem'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-100 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-3 sm:p-4 md:p-6">
      <div className="max-w-md mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <FaArrowLeft className="mr-2 text-sm sm:text-base" /> Back
        </motion.button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-xl shadow-2xl border border-blue-200"
        >
          {/* Doctor info */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <DoctorAvatar doctor={doctor} />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate">
                Dr. {doctor.fullName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {Array.isArray(doctor.specialist) ? doctor.specialist.join(', ') : doctor.specialist || 'General'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center gap-1 sm:gap-2">
                {[...Array(5)].map((_, i) => {
                  const ratingValue = i + 1;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <label>
                        <input
                          type="radio"
                          name="rating"
                          value={ratingValue}
                          onClick={() => setRating(ratingValue)}
                          className="hidden"
                        />
                        <FaStar
                          className="cursor-pointer text-2xl sm:text-3xl md:text-4xl transition-colors"
                          color={ratingValue <= (hover || rating) ? '#fbbf24' : '#d1d5db'}
                          onMouseEnter={() => setHover(ratingValue)}
                          onMouseLeave={() => setHover(0)}
                        />
                      </label>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {rating ? (
                  <>
                    You selected <span className="font-medium text-yellow-500">{rating}</span> star{rating > 1 ? 's' : ''}
                  </>
                ) : (
                  'Click a star to rate'
                )}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comment <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <textarea
                id="comment"
                rows={isMobile ? 3 : 4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this doctor..."
                className="w-full border border-blue-200 rounded-lg p-2 sm:p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50 resize-none"
              />
            </div>

            {/* Rating preview */}
            {rating > 0 && comment && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">Preview:</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-xs ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{rating}/5</span>
                </div>
                <p className="text-sm text-gray-700 italic">"{comment}"</p>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </motion.button>
          </form>

          {/* Note */}
          <p className="text-xs text-gray-400 mt-3 text-center">
            Your feedback helps other patients make informed decisions
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RateDoctor;