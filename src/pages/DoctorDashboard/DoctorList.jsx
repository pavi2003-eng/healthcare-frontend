import React, { useEffect, useState } from 'react';
import API from '../../api';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(true);

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
    if (specialty) {
      filteredDocs = filteredDocs.filter(d => d.specialist?.some(s => s.toLowerCase().includes(specialty.toLowerCase())));
    }
    if (gender) {
      filteredDocs = filteredDocs.filter(d => d.gender === gender);
    }
    setFiltered(filteredDocs);
  }, [specialty, gender, doctors]);

  if (loading) return <div className="text-center p-8">Loading doctors...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Available Doctors</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by specialty..."
          className="border p-2 rounded flex-1"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
        <select className="border p-2 rounded" value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(doc => (
          <div key={doc._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
                {doc.fullName.charAt(0)}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{doc.fullName}</h3>
                <p className="text-sm text-gray-600">{doc.specialist?.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.round(doc.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">({doc.totalRatings || 0} reviews)</span>
            </div>
            <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Gender:</span> {doc.gender}</p>
            <p className="text-sm text-gray-700 mb-4"><span className="font-medium">Contact:</span> {doc.contactNumber}</p>
            <Link
              to={`/patient/book-appointment?doctorId=${doc._id}`}
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Book Appointment
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorList;