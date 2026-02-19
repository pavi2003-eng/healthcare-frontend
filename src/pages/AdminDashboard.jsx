import React, { useEffect, useState } from 'react';
import API from '../api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await API.get('/users'); // need backend route
        const aptRes = await API.get('/appointments');
        setUsers(usersRes.data);
        setAppointments(aptRes.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Total Users</h3>
          <p className="text-3xl">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold">Total Appointments</h3>
          <p className="text-3xl">{appointments.length}</p>
        </div>
      </div>
      {/* Add tables to list users and appointments */}
    </div>
  );
};

export default AdminDashboard;