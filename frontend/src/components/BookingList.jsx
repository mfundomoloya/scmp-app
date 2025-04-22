import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BookingList = ({ refresh }) => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      console.log('Bookings fetched:', response.data);
      setBookings(response.data);
    } catch (err) {
      console.error('Fetch bookings error:', {
        message: err.message,
        response: err.response?.data,
      });
      setError(err.response?.data?.msg || 'Failed to fetch bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refresh]);

  const handleCancel = async (id) => {
    try {
      console.log('Cancelling booking:', id);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      console.log('Booking cancelled:', id);
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', {
        message: err.message,
        response: err.response?.data,
      });
      setError(err.response?.data?.msg || 'Failed to cancel booking');
    }
  };

  return (
    <div>
      <h2>Your Bookings</h2>
      {error && <p>{error}</p>}
      {bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              Room: {booking.room}, Date: {new Date(booking.date).toLocaleDateString()},
              Time: {booking.startTime} - {booking.endTime}, Status: {booking.status}
              {(booking.status !== 'cancelled' && (user.role === 'admin' || booking.userId === user.id)) && (
                <button onClick={() => handleCancel(booking._id)}>Cancel</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingList;