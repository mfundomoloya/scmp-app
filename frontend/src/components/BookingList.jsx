import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BookingList = ({ refresh }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    room: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  console.log(
    'BookingList: Rendering for user:',
    user?.id,
    'role:',
    user?.role
  );

  // Format date as dd-mm-yyyy
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return 'Invalid Date';
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Format time as HH:mm (24-hour clock, South African locale)
  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      console.warn('BookingList: Invalid time string:', timeString);
      return 'Invalid Time';
    }
    // Check if timeString is already in HH:mm format
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(timeString)) {
      return timeString; // Already in HH:mm format, e.g., "14:30"
    }
    // Try parsing as a full date-time string
    const t = new Date(timeString);
    if (!isNaN(t)) {
      return t.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    console.warn('BookingList: Failed to parse time:', timeString);
    return 'Invalid Time';
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log(
        'BookingList: Fetching bookings with token:',
        token ? '[REDACTED]' : null
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(
        'BookingList: Fetch response:',
        JSON.stringify(response.data, null, 2)
      );

      const allBookings = response.data;

      // Filter bookings for students
      const userBookings =
        user.role === 'student'
          ? allBookings.filter(
              (booking) =>
                booking.userId?._id === user.id || booking.userId === user.id
            )
          : allBookings;

      console.log(
        'BookingList: User bookings:',
        JSON.stringify(userBookings, null, 2)
      );
      setBookings(userBookings);
      setFilteredBookings(userBookings);
      setError(null);
    } catch (err) {
      console.error('BookingList: Fetch bookings error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.message ||
          'Failed to fetch bookings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...bookings];
    if (filters.status) {
      result = result.filter((b) => b.status === filters.status);
    }
    if (filters.room) {
      result = result.filter((b) =>
        b.room.toLowerCase().includes(filters.room.toLowerCase())
      );
    }
    if (filters.startDate) {
      result = result.filter(
        (b) => new Date(b.date) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      result = result.filter(
        (b) => new Date(b.date) <= new Date(filters.endDate)
      );
    }
    console.log('BookingList: Filtered bookings:', result.length);
    setFilteredBookings(result);
  }, [bookings, filters]);

  useEffect(() => {
    if (user) {
      console.log('BookingList: Triggering fetchBookings for user:', user.id);
      fetchBookings();
    } else {
      console.log('BookingList: No user, skipping fetchBookings');
    }
  }, [user, refresh]);

  // Handle approvals and status changes
  const handleCancel = async (id) => {
    setShowModal(id);
    setModalAction({ type: 'cancel' });
  };

  const handleStatusChange = async (id, status) => {
    setShowModal(id);
    setModalAction({ type: 'status', status });
  };

  const confirmAction = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (modalAction.type === 'cancel') {
        console.log('BookingList: Cancelling booking:', showModal);
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/bookings/${showModal}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('BookingList: Booking cancelled:', showModal);
      } else if (modalAction.type === 'status') {
        console.log('BookingList: Updating booking status:', {
          id: showModal,
          status: modalAction.status,
        });
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/bookings/${showModal}/status`,
          { status: modalAction.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('BookingList: Booking status updated:', {
          id: showModal,
          status: modalAction.status,
        });
      }
      fetchBookings();
    } catch (err) {
      console.error(
        `${
          modalAction.type === 'cancel' ? 'Cancel booking' : 'Update status'
        } error:`,
        {
          message: err.message,
          response: err.response?.data,
        }
      );
      setError(
        err.response?.data?.msg ||
          `Failed to ${
            modalAction.type === 'cancel' ? 'cancel booking' : 'update status'
          }`
      );
    } finally {
      setLoading(false);
      setShowModal(null);
      setModalAction(null);
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setModalAction(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const isAdmin = user?.role === 'admin';
  const title = isAdmin ? 'All Bookings' : 'My Bookings';

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900 text-green-200';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'cancelled':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  return (
    <div
      className="min-h-screen py-8"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="bg-black bg-opacity-80 text-white rounded-lg shadow-xl p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-center  text-white border-b border-gray-700 pb-4">
              {title}
            </h2>
            <Link
              to="/bookings/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
            >
              Create Booking
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-8 p-4 bg-gray-900 bg-opacity-70 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Filter Bookings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room
                </label>
                <input
                  type="text"
                  name="room"
                  value={filters.room}
                  onChange={handleFilterChange}
                  placeholder="Search by room name"
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() =>
                  setFilters({
                    status: '',
                    room: '',
                    startDate: '',
                    endDate: '',
                  })
                }
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300"
                disabled={loading}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Booking List */}
          {error && (
            <div className="bg-red-900 text-white p-4 rounded-md mb-6 flex justify-between items-center">
              <span>{error}</span>
              <div>
                <button
                  onClick={fetchBookings}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mr-2"
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-xl">Loading bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xl">No bookings found matching your filters</p>
              <p className="text-gray-400 mt-2">
                {isAdmin
                  ? 'No bookings exist in the system.'
                  : 'You have no bookings. Try creating a new booking or contact support if you believe this is an error.'}
              </p>
              {!isAdmin && (
                <p className="text-yellow-300 mt-2">
                  Debug: User ID: {user.id}, Role: {user.role}. If bookings
                  should exist, please check with an admin.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    {isAdmin && (
                      <>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Booked By
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                      </>
                    )}
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-800 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.room || 'Unknown Room'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(booking.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatTime(booking.startTime)} -{' '}
                        {formatTime(booking.endTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </td>
                      {isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.userId
                              ? `${booking.userId.firstName || ''} ${
                                  booking.userId.lastName || ''
                                }`.trim() || 'Unknown'
                              : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {booking.userId?.email || 'Unknown'}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAdmin ? (
                          <select
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(booking._id, e.target.value)
                            }
                            className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirm</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        ) : (
                          booking.status !== 'cancelled' &&
                          (booking.userId?._id === user.id ||
                            booking.userId === user.id) && (
                            <button
                              className="bg-red-800 hover:bg-red-700 text-white px-3 py-1 rounded-md transition duration-200"
                              onClick={() => handleCancel(booking._id)}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Confirm Action
                </h3>
                <p className="mb-6 text-gray-300">
                  {modalAction.type === 'cancel'
                    ? 'Are you sure you want to cancel this booking?'
                    : `Change status to ${modalAction.status}?`}
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                  >
                    No
                  </button>
                  <button
                    onClick={confirmAction}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Yes, Confirm'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingList;
