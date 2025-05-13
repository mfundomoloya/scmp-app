import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [pendingMaintenance, setPendingMaintenance] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Placeholder data - in a real app, you would fetch this from your API
  useEffect(() => {
    // Simulating API fetch
    setStats({
      totalUsers: 542,
      totalRooms: 38,
      activeBookings: 24,
      pendingMaintenanceRequests: 7,
    });

    setPendingMaintenance([
      {
        id: 1,
        issue: 'Projector not working',
        location: 'Room 103',
        date: '2 days ago',
        priority: 'High',
      },
      {
        id: 2,
        issue: 'AC malfunction',
        location: 'Lecture Hall B',
        date: '1 week ago',
        priority: 'Medium',
      },
      {
        id: 3,
        issue: 'Broken chair',
        location: 'Room 215',
        date: '3 days ago',
        priority: 'Low',
      },
    ]);

    setRecentBookings([
      {
        id: 1,
        room: 'Room 103',
        user: 'John Smith',
        purpose: 'Study group',
        date: 'Today, 15:00-17:00',
      },
      {
        id: 2,
        room: 'Conference Room A',
        user: 'Dr. Emily Chen',
        purpose: 'Department meeting',
        date: 'Tomorrow, 10:00-12:00',
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen relative pt-16">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0  top-16 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url(/src/assets/lecture-hall.jpg)',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              {user ? `Welcome, ${user.name}` : 'Admin Dashboard'}
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Manage campus resources, users, and system settings all in one
              place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/admin/rooms"
                className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center"
                style={{ backgroundColor: '#2563EB', color: 'white' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                Manage Rooms
              </Link>
              <Link
                to="/admin/bookings"
                className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center"
                style={{ backgroundColor: '#2563EB', color: 'white' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
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
                View Bookings
              </Link>
              <Link
                to="/admin/maintenance"
                className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center"
                style={{ backgroundColor: '#2563EB', color: 'white' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                Maintenance
              </Link>
              <Link
                to="/admin/timetables"
                className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md flex items-center"
                style={{ backgroundColor: '#2563EB', color: 'white' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                Timetables
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div
                className="text-blue-600 text-2xl font-bold"
                style={{ color: '#2563EB' }}
              >
                {stats.totalUsers || 0}
              </div>
              <div className="text-gray-600 text-sm">Total Users</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div
                className="text-blue-600 text-2xl font-bold"
                style={{ color: '#2563EB' }}
              >
                {stats.totalRooms || 0}
              </div>
              <div className="text-gray-600 text-sm">Available Rooms</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div
                className="text-blue-600 text-2xl font-bold"
                style={{ color: '#2563EB' }}
              >
                {stats.activeBookings || 0}
              </div>
              <div className="text-gray-600 text-sm">Active Bookings</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div
                className="text-blue-600 text-2xl font-bold"
                style={{ color: '#2563EB' }}
              >
                {stats.pendingMaintenanceRequests || 0}
              </div>
              <div className="text-gray-600 text-sm">Pending Maintenance</div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Requests */}
            <div className="bg-white rounded-xl shadow-lg h-full">
              <div className="p-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#2563EB"
                    style={{ color: '#2563EB' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-black">
                    Maintenance Requests
                  </h2>
                </div>
                <Link
                  to="/admin/maintenance"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  style={{ color: '#2563EB' }}
                >
                  View All
                </Link>
              </div>

              <div className="p-4">
                {pendingMaintenance.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {pendingMaintenance.map((item) => (
                      <div key={item.id} className="py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-black">
                              {item.issue}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {item.location} • {item.date}
                            </p>
                          </div>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full
                              ${
                                item.priority === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : item.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No pending maintenance requests
                  </p>
                )}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-lg h-full">
              <div className="p-5 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#2563EB"
                    style={{ color: '#2563EB' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-black">
                    Recent Bookings
                  </h2>
                </div>
                <Link
                  to="/admin/bookings"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  style={{ color: '#2563EB' }}
                >
                  View All
                </Link>
              </div>

              <div className="p-4">
                {recentBookings.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="py-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-black">
                              {booking.room}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.user} • {booking.purpose}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {booking.date}
                            </p>
                          </div>
                          <button
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                            style={{
                              color: '#2563EB',
                              backgroundColor: '#EFF6FF',
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent bookings
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#2563EB"
                style={{ color: '#2563EB' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Admin Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                to="/admin/users"
                className="flex items-center p-3 bg-gray-50 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
                style={{
                  ':hover': { backgroundColor: '#EFF6FF', color: '#2563EB' },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#2563EB"
                  style={{ color: '#2563EB' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                User Management
              </Link>
              <Link
                to="/admin/rooms/import"
                className="flex items-center p-3 bg-gray-50 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
                style={{
                  ':hover': { backgroundColor: '#EFF6FF', color: '#2563EB' },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#2563EB"
                  style={{ color: '#2563EB' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import Rooms
              </Link>
              <Link
                to="/admin/timetables/import"
                className="flex items-center p-3 bg-gray-50 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
                style={{
                  ':hover': { backgroundColor: '#EFF6FF', color: '#2563EB' },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#2563EB"
                  style={{ color: '#2563EB' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import Timetables
              </Link>
              <Link
                to="/profile"
                className="flex items-center p-3 bg-gray-50 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
                style={{
                  ':hover': { backgroundColor: '#EFF6FF', color: '#2563EB' },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#2563EB"
                  style={{ color: '#2563EB' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
