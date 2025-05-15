import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookingList = ({ refresh }) => {
  // Define colors explicitly - matching the footer colors
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const dangerColor = '#ef4444'; // red-500 equivalent
  const dangerHoverColor = '#dc2626'; // red-600 equivalent

  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentView, setCurrentView] = useState('upcoming');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [refresh, currentView, user.id]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: {
            filter: currentView,
            userId: user.role === 'admin' ? null : user.id,
          },
        }
      );
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (confirmDelete !== bookingId) {
      setConfirmDelete(bookingId);
      // Auto-reset confirm after 5 seconds
      setTimeout(() => {
        if (confirmDelete === bookingId) {
          setConfirmDelete(null);
        }
      }, 5000);
      return;
    }

    setDeletingId(bookingId);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setBookings(bookings.filter((booking) => booking._id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const getStatusBadge = (booking) => {
    const now = new Date();
    const startTime = new Date(`${booking.date}T${booking.startTime}`);
    const endTime = new Date(`${booking.date}T${booking.endTime}`);

    // Format for comparisons
    now.setSeconds(0, 0);
    startTime.setSeconds(0, 0);
    endTime.setSeconds(0, 0);

    if (endTime < now) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <span className="mr-1 w-2 h-2 rounded-full bg-gray-400"></span>
          Completed
        </span>
      );
    }

    if (startTime <= now && now <= endTime) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium animate-pulse"
          style={{ backgroundColor: lightBlueColor, color: blueColor }}
        >
          <span className="mr-1 w-2 h-2 rounded-full bg-blue-500"></span>
          Active Now
        </span>
      );
    }

    // Upcoming
    const bookingDay = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    bookingDay.setHours(0, 0, 0, 0);

    if (bookingDay.getTime() === today.getTime()) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: 'linear-gradient(145deg, #fef3c7, #fcd34d)',
            color: '#92400e',
          }}
        >
          <span className="mr-1 w-2 h-2 rounded-full bg-amber-500"></span>
          Today
        </span>
      );
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (bookingDay.getTime() === tomorrow.getTime()) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: 'linear-gradient(145deg, #d1fae5, #a7f3d0)',
            color: '#065f46',
          }}
        >
          <span className="mr-1 w-2 h-2 rounded-full bg-green-500"></span>
          Tomorrow
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: veryLightBlueColor, color: blueColor }}
      >
        <span className="mr-1 w-2 h-2 rounded-full bg-blue-500"></span>
        Upcoming
      </span>
    );
  };

  const renderActionButton = (booking) => {
    const now = new Date();
    const startTime = new Date(`${booking.date}T${booking.startTime}`);
    const endTime = new Date(`${booking.date}T${booking.endTime}`);

    // Format for comparisons
    now.setSeconds(0, 0);
    startTime.setSeconds(0, 0);
    endTime.setSeconds(0, 0);

    if (endTime < now) {
      return null; // No actions for completed bookings
    }

    const isConfirming = confirmDelete === booking._id;

    return (
      <button
        onClick={() => handleCancelBooking(booking._id)}
        disabled={deletingId === booking._id}
        className={`text-sm rounded-md py-1.5 px-3 font-medium focus:outline-none transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95 ${
          isConfirming ? 'text-white' : 'text-red-500 hover:bg-red-50'
        }`}
        style={{
          backgroundColor: isConfirming ? dangerColor : 'transparent',
          border: isConfirming ? 'none' : `1px solid ${dangerColor}`,
        }}
        onMouseOver={(e) => {
          if (isConfirming) {
            e.target.style.backgroundColor = dangerHoverColor;
          }
        }}
        onMouseOut={(e) => {
          if (isConfirming) {
            e.target.style.backgroundColor = dangerColor;
          }
        }}
      >
        {deletingId === booking._id ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Cancelling...
          </span>
        ) : isConfirming ? (
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Confirm Cancel
          </span>
        ) : (
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </span>
        )}
      </button>
    );
  };

  // New functions for sorting and filtering
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBookings = () => {
    const sorted = [...bookings];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'room') {
          aValue = a.roomId?.name || '';
          bValue = b.roomId?.name || '';
        } else if (sortConfig.key === 'date') {
          aValue = new Date(`${a.date}T${a.startTime}`);
          bValue = new Date(`${b.date}T${b.startTime}`);
        } else if (sortConfig.key === 'purpose') {
          aValue = a.purpose || '';
          bValue = b.purpose || '';
        } else {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sorted;
  };

  const filteredBookings = () => {
    if (!searchTerm) return sortedBookings();

    return sortedBookings().filter((booking) => {
      const roomName = booking.roomId?.name?.toLowerCase() || '';
      const purpose = booking.purpose?.toLowerCase() || '';
      const date = new Date(booking.date).toLocaleDateString().toLowerCase();

      const searchLower = searchTerm.toLowerCase();
      return (
        roomName.includes(searchLower) ||
        purpose.includes(searchLower) ||
        date.includes(searchLower)
      );
    });
  };

  // View Selection Tabs
  const viewOptions = [
    {
      id: 'upcoming',
      name: 'Upcoming',
      icon: 'M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z',
    },
    {
      id: 'past',
      name: 'Past',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      id: 'all',
      name: 'All Bookings',
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: blueColor }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p
            className="text-lg font-medium animate-pulse"
            style={{ color: blueColor }}
          >
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-md p-4 mb-4"
        style={{ backgroundColor: '#fee2e2' }} // red-100
      >
        <div className="flex">
          <svg
            className="h-5 w-5 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{ color: dangerColor }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium" style={{ color: dangerColor }}>
              {error}
            </p>
            <button
              className="mt-2 text-sm underline"
              style={{ color: dangerColor }}
              onClick={fetchBookings}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* View Selection Tabs */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-1 flex space-x-1">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setCurrentView(option.id);
                setConfirmDelete(null);
              }}
              className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
                currentView === option.id ? 'shadow-sm' : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor:
                  currentView === option.id ? 'white' : 'transparent',
                color: currentView === option.id ? blueColor : 'gray',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={option.icon}
                />
              </svg>
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-64">
          <div
            className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-200 ${
              isSearchFocused ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10 pr-4 py-2 w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-2"
            style={{
              borderColor: isSearchFocused ? blueColor : '#e5e7eb',
              boxShadow: isSearchFocused ? `0 0 0 1px ${blueColor}` : 'none',
            }}
          />
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500 w-full md:w-auto justify-end">
          <span>Sort by:</span>
          <select
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction });
            }}
            className="border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:border-blue-300 text-sm"
            style={{ borderColor: '#e5e7eb' }}
          >
            <option value="date-asc">Date (Earliest)</option>
            <option value="date-desc">Date (Latest)</option>
            <option value="room-asc">Room (A-Z)</option>
            <option value="purpose-asc">Purpose (A-Z)</option>
          </select>
        </div>
      </div>

      {filteredBookings().length === 0 ? (
        <div
          className="bg-white rounded-lg border border-gray-200 p-8 text-center"
          style={{ borderStyle: 'dashed' }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: blueColor }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2" style={{ color: blueColor }}>
            No Bookings Found
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            {searchTerm
              ? `No bookings matching "${searchTerm}"`
              : currentView === 'upcoming'
              ? "You don't have any upcoming bookings."
              : currentView === 'past'
              ? "You don't have any past bookings."
              : "You don't have any bookings yet."}
          </p>
          {currentView !== 'upcoming' && !searchTerm && (
            <button
              onClick={() => setCurrentView('upcoming')}
              className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-md"
              style={{ backgroundColor: lightBlueColor, color: blueColor }}
            >
              View Upcoming Bookings
            </button>
          )}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-md"
              style={{ backgroundColor: lightBlueColor, color: blueColor }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    style={{ color: blueColor }}
                    onClick={() => requestSort('room')}
                  >
                    <div className="flex items-center">
                      Room
                      {sortConfig.key === 'room' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              sortConfig.direction === 'asc'
                                ? 'M5 15l7-7 7 7'
                                : 'M19 9l-7 7-7-7'
                            }
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    style={{ color: blueColor }}
                    onClick={() => requestSort('date')}
                  >
                    <div className="flex items-center">
                      Date & Time
                      {sortConfig.key === 'date' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              sortConfig.direction === 'asc'
                                ? 'M5 15l7-7 7 7'
                                : 'M19 9l-7 7-7-7'
                            }
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    style={{ color: blueColor }}
                    onClick={() => requestSort('purpose')}
                  >
                    <div className="flex items-center">
                      Purpose
                      {sortConfig.key === 'purpose' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 ml-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              sortConfig.direction === 'asc'
                                ? 'M5 15l7-7 7 7'
                                : 'M19 9l-7 7-7-7'
                            }
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: blueColor }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: blueColor }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings().map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center mr-3"
                          style={{ backgroundColor: veryLightBlueColor }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{ color: blueColor }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.roomId?.name || 'Unknown Room'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.roomId?.building || ''}{' '}
                            {booking.roomId?.floor
                              ? `Floor ${booking.roomId.floor}`
                              : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5 text-gray-400"
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
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {new Date(
                            `2000-01-01T${booking.startTime}`
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' to '}
                          {new Date(
                            `2000-01-01T${booking.endTime}`
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              booking.purpose === 'Study'
                                ? '#2563eb'
                                : booking.purpose === 'Meeting'
                                ? '#7c3aed'
                                : booking.purpose === 'Project Work'
                                ? '#d97706'
                                : booking.purpose === 'Event'
                                ? '#059669'
                                : '#6b7280',
                          }}
                        ></div>
                        {booking.purpose}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {renderActionButton(booking)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;
