import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import { motion } from 'framer-motion';
import { FaStar, FaArrowLeft, FaUserMd } from 'react-icons/fa';
import Swal from 'sweetalert2';

// Helper for image URL (same as in PatientDashboard)
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
      Swal.fire('Rating required', 'Please select a star rating.', 'warning');
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

      Swal.fire('Thank you!', 'Your rating has been submitted.', 'success');
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Rating submission failed:', error);
      Swal.fire(
        'Error',
        'Failed to submit rating. You may have already rated this appointment.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back
        </motion.button>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-blue-200"
        >
          {/* Doctor info */}
          <div className="flex items-center gap-4 mb-6">
            <DoctorAvatar doctor={doctor} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Rate Dr. {doctor.fullName}</h2>
              <p className="text-sm text-gray-600">{doctor.specialist?.join(', ')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating <span className="text-red-500">*</span></label>
              <div className="flex justify-center gap-1">
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
                          className="cursor-pointer text-4xl transition-colors"
                          color={ratingValue <= (hover || rating) ? '#fbbf24' : '#d1d5db'}
                          onMouseEnter={() => setHover(ratingValue)}
                          onMouseLeave={() => setHover(0)}
                        />
                      </label>
                    </motion.div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">
                {rating ? `You selected ${rating} star${rating > 1 ? 's' : ''}` : 'Click a star to rate'}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                id="comment"
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this doctor..."
                className="w-full border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white/50"
              />
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Submitting...
                </span>
              ) : (
                'Submit Rating'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RateDoctor;