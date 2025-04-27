import { useState, useEffect } from 'react';
import axios from 'axios';

const BookingForm = ({ onBookingCreated }) => {
  const [formData, setFormData] = useState({
    room: '',
    date: '',
    timeSlot: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const rooms = ['Building 10-L44', 'Building 12-R22', 'Lecture Hall A', 'Lab B'];

  const fetchAvailableSlots = async () => {
    if (!formData.room || !formData.date) {
      setAvailableSlots([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/bookings/available?room=${encodeURIComponent(formData.room)}&date=${formData.date}`,
        {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        }
      );
      setAvailableSlots(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch available slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [formData.room, formData.date]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.timeSlot) {
      setError('Please select a time slot');
      return;
    }
    try {
      setLoading(true);
      const [startTime, endTime] = formData.timeSlot.split('-');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        {
          room: formData.room,
          date: formData.date,
          startTime: new Date(`${formData.date}T${startTime}`),
          endTime: new Date(`${formData.date}T${endTime}`),
        },
        {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        }
      );
      onBookingCreated();
      setFormData({ room: '', date: '', timeSlot: '' });
      setAvailableSlots([]);
      setError('');
    } catch (err) {
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="room" className="block text-sm font-medium text-gray-700">
          Room
        </label>
        <select
          id="room"
          name="room"
          value={formData.room}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">
          Time Slot
        </label>
        <select
          id="timeSlot"
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          disabled={!formData.room || !formData.date || loading}
          required
        >
          <option value="">Select a time slot</option>
          {availableSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {loading && <p className="text-gray-500">Loading slots...</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Creating...' : 'Create Booking'}
      </button>
    </form>
  );
};

export default BookingForm;