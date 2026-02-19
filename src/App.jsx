import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageDoctors from './pages/Admin/ManageDoctors';
import ManagePatients from './pages/Admin/ManagePatients';

// Doctor pages
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import AppointmentList from './pages/DoctorDashboard/AppointmentList';
import PatientDetail from './pages/DoctorDashboard/PatientDetail';
import DoctorChats from './pages/DoctorDashboard/Chats';
import DoctorViewChat from './pages/DoctorDashboard/ViewChat';
import BookAppointmentDoc from './pages/DoctorDashboard/BookAppointmentDoc';
import DepartmentList from './pages/DoctorDashboard/DepartmentList';

// Patient pages
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import PatientDoctorList from './pages/PatientDashboard/DoctorList';
import PatientBookAppointment from './pages/PatientDashboard/BookAppointment';
import PatientAppointments from './pages/PatientDashboard/PatientAppointments';
import PatientChats from './pages/PatientDashboard/Chats';
import PatientViewChat from './pages/PatientDashboard/ViewChat';
import RateDoctor from './pages/PatientDashboard/RateDoctor';
import UpdateAppointment from './pages/PatientDashboard/UpdateAppointment';

// Profile page (common for all roles)
import Profile from './pages/Profile';  // ✅ Correct import (capital P)

const RedirectToDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Layout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctors" element={<ManageDoctors />} />
                <Route path="patients" element={<ManagePatients />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Doctor routes */}
            <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor" element={<Layout />}>
                <Route index element={<DoctorDashboard />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="patients/:patientId" element={<PatientDetail />} />
                <Route path="chats" element={<DoctorChats />} />
                <Route path="chats/:chatId" element={<DoctorViewChat />} />
                <Route path="book-appointment" element={<BookAppointmentDoc />} />
                <Route path="departments" element={<DepartmentList />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Patient routes */}
            <Route element={<PrivateRoute allowedRoles={['patient']} />}>
              <Route path="/patient" element={<Layout />}>
                <Route index element={<PatientDashboard />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="doctors" element={<PatientDoctorList />} />
                <Route path="book-appointment" element={<PatientBookAppointment />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="chats" element={<PatientChats />} />
                <Route path="chats/:chatId" element={<PatientViewChat />} />
                <Route path="rate-doctor/:doctorId" element={<RateDoctor />} />
                <Route path="update-appointment/:id" element={<UpdateAppointment />} />
                <Route path="departments" element={<DepartmentList />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="*" element={<RedirectToDashboard />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;