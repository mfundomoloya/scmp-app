import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminBookings from './pages/AdminBookings';
import Login from './components/Login';
import Register from './components/Register';
import VerifyEmail from './pages/VerifyEmail';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import NotificationToast from './components/NotificationToast';
import Bookings from './pages/Bookings';
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import RoomImport from './components/RoomImport';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import MaintenanceAdmin from './components/MaintenanceAdmin';
import MaintenanceReportPage from './pages/MaintenanceReportPage';
import TimetableViewer from './pages/TimetableViewer';
import TimetableImport from './pages/TimetableImport';
import TimetableAdmin from './pages/TimetableAdmin';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <ToastContainer />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/rooms" element={<RoomList />} />
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute role="lecturer">
                  <LecturerDashboard />
                </ProtectedRoute>
              }
            />
             <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute role="admin">
              <RoomForm />
            </ProtectedRoute>
          }
        />
             <Route
          path="/admin/rooms/import"
          element={
            <ProtectedRoute role="admin">
              <RoomImport />
            </ProtectedRoute>
          }
        />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute role={['student', 'lecturer']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            <Route path="/bookings/list" element={<BookingList />} />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute role="admin">
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
          path="/maintenance/report"
          element={
            <ProtectedRoute allowedRoles={['student', 'lecturer']}>
              <MaintenanceReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/maintenance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MaintenanceAdmin />
            </ProtectedRoute>
          }
        />
         <Route
          path="/timetable"
          element={
            <ProtectedRoute allowedRoles={['student', 'lecturer']}>
              <TimetableViewer />
            </ProtectedRoute>
          }
        />
                <Route
          path="/admin/timetables/import"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TimetableImport />
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin/timetables"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TimetableAdmin />
            </ProtectedRoute>
          }
        />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </NotificationProvider>
  );
}

export default App;