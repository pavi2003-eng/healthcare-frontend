import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const BookAppointmentDoc = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    appointmentReason: '',
    appointmentType: 'Consultation',
    consultingDoctor: user?.name || '',
    notes: '',
    patientName: '',
    patientEmail: '',
    patientGender: 'Female',
    patientAge: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        doctorId: user.doctorId,
        status: 'Scheduled'
      };
      await API.post('/appointments', payload);
      Swal.fire('Success!', 'Appointment booked successfully', 'success');
      navigate('/doctor/appointments');
    } catch (error) {
      console.error('Booking failed:', error);
      Swal.fire('Error', 'Booking failed', 'error');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Book Appointment for Patient</h2>
      <div className="bg-white p-6 rounded shadow max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Patient Name</label>
              <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Patient Email</label>
              <input type="email" name="patientEmail" value={formData.patientEmail} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Patient Age</label>
              <input type="number" name="patientAge" value={formData.patientAge} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Patient Gender</label>
              <select name="patientGender" value={formData.patientGender} onChange={handleChange} className="w-full border p-2 rounded">
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Appointment Date</label>
              <input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Appointment Time</label>
              <input type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Appointment Type</label>
              <select name="appointmentType" value={formData.appointmentType} onChange={handleChange} className="w-full border p-2 rounded">
                <option>Consultation</option>
                <option>Procedure</option>
                <option>Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Consulting Doctor</label>
              <input type="text" name="consultingDoctor" value={formData.consultingDoctor} onChange={handleChange} className="w-full border p-2 rounded" required readOnly />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Appointment Reason</label>
              <input type="text" name="appointmentReason" value={formData.appointmentReason} onChange={handleChange} className="w-full border p-2 rounded" required />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Notes</label>
              <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} className="w-full border p-2 rounded"></textarea>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => navigate(-1)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Book</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentDoc;