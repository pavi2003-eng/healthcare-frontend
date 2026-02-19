import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import Swal from 'sweetalert2';

const UpdateAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    appointmentReason: '',
    appointmentType: '',
    consultingDoctor: '',
    notes: ''
  });

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await API.get(`/appointments/${id}`);
        setFormData({
          appointmentDate: res.data.appointmentDate.split('T')[0],
          appointmentTime: res.data.appointmentTime,
          appointmentReason: res.data.appointmentReason,
          appointmentType: res.data.appointmentType,
          consultingDoctor: res.data.consultingDoctor,
          notes: res.data.notes || ''
        });
      } catch (error) {
        console.error('Error fetching appointment:', error);
        Swal.fire('Error', 'Could not load appointment.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/appointments/${id}`, formData);
      Swal.fire('Updated!', 'Appointment updated successfully.', 'success');
      navigate('/patient/appointments');
    } catch (error) {
      console.error('Update failed:', error);
      Swal.fire('Error', 'Update failed.', 'error');
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Cancel appointment?',
      text: 'Are you sure you want to cancel this appointment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it'
    });
    if (result.isConfirmed) {
      try {
        await API.delete(`/appointments/${id}`);
        Swal.fire('Cancelled!', 'Appointment has been cancelled.', 'success');
        navigate('/patient/appointments');
      } catch (error) {
        console.error('Cancel failed:', error);
        Swal.fire('Error', 'Cancel failed.', 'error');
      }
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Update Appointment</h2>
      <div className="bg-white p-6 rounded shadow max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">Appointment Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Appointment Time</label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-medium mb-1">Reason</label>
              <input
                type="text"
                name="appointmentReason"
                value={formData.appointmentReason}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Type</label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option>Consultation</option>
                <option>Procedure</option>
                <option>Follow-up</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Doctor</label>
              <input
                type="text"
                name="consultingDoctor"
                value={formData.consultingDoctor}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            ></textarea>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
            <button type="button" onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded">Cancel Appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAppointment;