import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats] = useState({
    totalBookings: 156,
    pendingBookings: 23,
    confirmedBookings: 118,
    cancelledBookings: 15,
    totalRooms: 12,
    totalUsers: 87,
  });

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1956&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto p-6 pt-10">
        {/* Welcome Header */}
        <div className="bg-black bg-opacity-70 text-white rounded-lg shadow-xl p-8 mb-8 text-center backdrop-blur-sm">
          <h1 className="text-4xl font-bold mb-2">
            {user ? `Welcome, ${user.name}` : 'Admin Dashboard'}
          </h1>
          <p className="text-xl text-gray-300">
            Manage your campus resources and services in one place
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black bg-opacity-70 rounded-lg shadow-lg text-white p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              Booking Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Bookings:</span>
                <span className="font-bold">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-bold text-yellow-400">
                  {stats.pendingBookings}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Confirmed:</span>
                <span className="font-bold text-green-400">
                  {stats.confirmedBookings}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cancelled:</span>
                <span className="font-bold text-red-400">
                  {stats.cancelledBookings}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black bg-opacity-70 rounded-lg shadow-lg text-white p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              Resource Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Rooms:</span>
                <span className="font-bold">{stats.totalRooms}</span>
              </div>
              <div className="flex justify-between">
                <span>Available Now:</span>
                <span className="font-bold text-green-400">8</span>
              </div>
              <div className="flex justify-between">
                <span>In Use:</span>
                <span className="font-bold text-blue-400">4</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance:</span>
                <span className="font-bold text-red-400">0</span>
              </div>
            </div>
          </div>

          <div className="bg-black bg-opacity-70 rounded-lg shadow-lg text-white p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              User Management
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-bold">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between">
                <span>Students:</span>
                <span className="font-bold">68</span>
              </div>
              <div className="flex justify-between">
                <span>Lecturers:</span>
                <span className="font-bold">16</span>
              </div>
              <div className="flex justify-between">
                <span>Admins:</span>
                <span className="font-bold">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/bookings"
            className="bg-black bg-opacity-70 hover:bg-opacity-80 transition-all duration-300 rounded-lg shadow-lg text-white p-6 text-center backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-bold">Manage Bookings</h3>
            <p className="text-gray-300 mt-2">
              View and manage all campus bookings
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="bg-black bg-opacity-70 hover:bg-opacity-80 transition-all duration-300 rounded-lg shadow-lg text-white p-6 text-center backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="text-xl font-bold">User Management</h3>
            <p className="text-gray-300 mt-2">
              Manage students and faculty members
            </p>
          </Link>

          <Link
            to="/admin/rooms"
            className="bg-black bg-opacity-70 hover:bg-opacity-80 transition-all duration-300 rounded-lg shadow-lg text-white p-6 text-center backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="text-xl font-bold">Room Management</h3>
            <p className="text-gray-300 mt-2">
              Configure room settings and availability
            </p>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-black bg-opacity-70 hover:bg-opacity-80 transition-all duration-300 rounded-lg shadow-lg text-white p-6 text-center backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-bold">Analytics & Reports</h3>
            <p className="text-gray-300 mt-2">
              View system statistics and generate reports
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
