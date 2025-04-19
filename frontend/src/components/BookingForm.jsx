import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BookingForm = ({ onBookingCreated }) => {
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      console.log('Creating booking:', { room, date, startTime, endTime });
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        { room, date, startTime, endTime },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      console.log('Booking response:', response.data);
      setMessage(response.data.msg);
      setRoom('');
      setDate('');
      setStartTime('');
      setEndTime('');
      if (onBookingCreated) onBookingCreated();
    } catch (err) {
      console.error('Booking error:', {
        message: err.message,
        response: err.response?.data,
      });
      setError(err.response?.data?.msg || 'Failed to create booking');
    }
  };

  if (!user || (user.role !== 'student' && user.role !== 'lecturer')) {
    return <p>Unauthorized to create bookings</p>;
  }

  return (
    <div>
      <h2>Create Booking</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Room:</label>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Start Time:</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div>
          <label>End Time:</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
        <button type="submit">Book Room</button>
      </form>
    </div>
  );
};

export default BookingForm;