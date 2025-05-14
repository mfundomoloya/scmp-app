import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
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
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import RoomImport from './components/RoomImport';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import MaintenanceAdmin from './components/MaintenanceAdmin';
import MaintenanceReportPage from './pages/MaintenanceReportPage';
import MaintenanceReportList from './components/MaintenanceList';
import TimetableViewer from './pages/TimetableViewer';
import TimetableImport from './pages/TimetableImport';
import TimetableAdmin from './pages/TimetableAdmin';
import ProfileSettings from './pages/ProfileSettings';
import Announcements from './components/Announcements';
import AnnouncementAdmin from './components/AnnouncementAdmin';
import RequestHistory from './components/RequestHistory';

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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/rooms" element={<RoomList />} />
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerDashboard />
                </ProtectedRoute>
              }
            />
             <Route
              path="/requests"
              element={
                <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                  <RequestHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoomForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms/import"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RoomImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                  <BookingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/new"
              element={
                <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings/list"
              element={
                <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                  <BookingList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/report"
              element={
                <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                  <MaintenanceReportList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/new"
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
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnnouncementAdmin />
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