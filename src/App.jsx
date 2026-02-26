import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageDoctors from './pages/Admin/ManageDoctors';
import ManagePatients from './pages/Admin/ManagePatients';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard';
import AppointmentList from './pages/DoctorDashboard/AppointmentList';
import PatientDetail from './pages/DoctorDashboard/PatientDetail';
import DoctorChats from './pages/DoctorDashboard/Chats';
import DoctorViewChat from './pages/DoctorDashboard/ViewChat';
import BookAppointmentDoc from './pages/DoctorDashboard/BookAppointmentDoc';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import PatientDoctorList from './pages/PatientDashboard/DoctorList';
import PatientBookAppointment from './pages/PatientDashboard/BookAppointment';
import PatientAppointments from './pages/PatientDashboard/PatientAppointments';
import PatientChats from './pages/PatientDashboard/Chats';
import PatientViewChat from './pages/PatientDashboard/ViewChat';
import RateDoctor from './pages/PatientDashboard/RateDoctor';
import UpdateAppointment from './pages/PatientDashboard/UpdateAppointment';
import Profile from './pages/Profile';

// Enhanced ScrollToTop component with multiple strategies
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Strategy 1: Immediate scroll
    window.scrollTo(0, 0);
    
    // Strategy 2: Scroll after a tiny delay (for when DOM needs time to render)
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto' // Use 'auto' instead of 'smooth' for instant scroll
      });
    }, 50);

    // Strategy 3: Force scroll on the main content area if it exists
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // Strategy 4: Try to scroll any scrollable containers
    const scrollableElements = document.querySelectorAll('.overflow-auto, .overflow-y-auto');
    scrollableElements.forEach(element => {
      element.scrollTop = 0;
    });

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
};

// Alternative: If you're using React 18 with Concurrent Features
const ScrollToTopWithRequestAnimationFrame = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame for better timing
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      
      // Also scroll any main content areas
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
};

// Redirect based on user role
const RedirectToDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (user.role === 'patient') return <Navigate to="/patient/dashboard" replace />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {/* Use the enhanced ScrollToTop component */}
          <ScrollToTop />
          
          {/* Alternative: If still having issues, uncomment below and comment above */}
          {/* <ScrollToTopWithRequestAnimationFrame /> */}

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Layout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctors" element={<ManageDoctors />} />
                <Route path="patients" element={<ManagePatients />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Doctor Routes */}
            <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
              <Route path="/doctor" element={<Layout />}>
                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="appointments" element={<AppointmentList />} />
                <Route path="patients/:patientId" element={<PatientDetail />} />
                <Route path="chats" element={<DoctorChats />} />
                <Route path="chats/:chatId" element={<DoctorViewChat />} />
                <Route path="book-appointment" element={<BookAppointmentDoc />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Patient Routes */}
            <Route element={<PrivateRoute allowedRoles={['patient']} />}>
              <Route path="/patient" element={<Layout />}>
                <Route index element={<Navigate to="/patient/dashboard" replace />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="doctors" element={<PatientDoctorList />} />
                <Route path="book-appointment" element={<PatientBookAppointment />} />
                <Route path="appointments" element={<PatientAppointments />} />
                <Route path="chats" element={<PatientChats />} />
                <Route path="chats/:chatId" element={<PatientViewChat />} />
                <Route path="rate-doctor/:doctorId" element={<RateDoctor />} />
                <Route path="update-appointment/:id" element={<UpdateAppointment />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch-all: Redirect unknown routes to dashboard */}
            <Route path="*" element={<RedirectToDashboard />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
