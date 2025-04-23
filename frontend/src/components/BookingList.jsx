import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log('Fetching bookings for user:', { id: user.id, role: user.role });
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      console.log('Bookings fetched:', response.data);
      setBookings(response.data);
      setFilteredBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Fetch bookings error:', {
        message: err.message,
        response: err.response?.data,
      });
      setError(err.response?.data?.msg || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  //apply the filters

  useEffect(() => {
    let result = [...bookings];
    if (filters.status) {
      result = result.filter((b) => b.status === filters.status);
    }
    if (filters.room) {
      result = result.filter((b) => b.room.toLowerCase().includes(filters.room.toLowerCase()));
    }
    if (filters.startDate) {
      result = result.filter((b) => new Date(b.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      result = result.filter((b) => new Date(b.date) <= new Date(filters.endDate));
    }
    setFilteredBookings(result);
  }, [bookings, filters]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, refresh]);

  //this handles approvals and status changes
  const handleStatusChange = async (id, status) => {
    if (window.confirm(`Change status to ${status}?`)) {
      setLoading(true);
      try {
        console.log('Updating booking status:', { id, status });
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/bookings/${id}/status`,
          { status },
          { headers: { 'x-auth-token': localStorage.getItem('token') } }
        );
        console.log('Booking status updated:', { id, status });
        fetchBookings();
      } catch (err) {
        console.error('Update status error:', {
          message: err.message,
          response: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to update booking status');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const isAdmin = user.role === 'admin';
  const title = isAdmin ? 'Bookings' : 'My Bookings';

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Room</label>
          <input
            type="text"
            name="room"
            value={filters.room}
            onChange={handleFilterChange}
            placeholder="e.g., Building 10-L44"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={loading}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ status: '', room: '', startDate: '', endDate: '' })}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            Clear Filters
          </button>
        </div>
      </div>
      {/* Booking List */}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-600 mb-4">Loading bookings...</p>}
      {!loading && filteredBookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Room</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Time</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                {isAdmin && (
                  <>
                    <th className="border border-gray-300 px-4 py-2 text-left">Booked By</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  </>
                )}
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{booking.room}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(booking.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {booking.startTime} - {booking.endTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 capitalize">{booking.status}</td>
                  {isAdmin && (
                    <>
                      <td className="border border-gray-300 px-4 py-2">{booking.userId?.name || 'Unknown'}</td>
                      <td className="border border-gray-300 px-4 py-2">{booking.userId?.email || 'Unknown'}</td>
                    </>
                  )}
                  <td className="border border-gray-300 px-4 py-2">
                    {isAdmin ? (
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={loading}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      booking.status !== 'cancelled' &&
                      (booking.userId === user.id || booking.userId?._id === user.id) && (
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
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
    </div>
  );
};

export default BookingList;