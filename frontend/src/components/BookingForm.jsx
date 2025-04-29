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
  const [success, setSuccess] = useState('');

  const rooms = [
    'Building 10-L44',
    'Building 12-R22',
    'Lecture Hall A',
    'Lab B',
  ];

  const fetchAvailableSlots = async () => {
    if (!formData.room || !formData.date) {
      setAvailableSlots([]);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/bookings/available?room=${encodeURIComponent(
          formData.room
        )}&date=${formData.date}`,
        {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        }
      );
      setAvailableSlots(response.data);
      setError('');
      // eslint-disable-next-line no-unused-vars
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
    // Clear any previous success message when form changes
    setSuccess('');
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
      await axios.post(
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

      // Set success message
      setSuccess('Booking created successfully!');

      // Call the parent callback
      if (onBookingCreated) {
        onBookingCreated();
      }

      // Reset form
      setFormData({ room: '', date: '', timeSlot: '' });
      setAvailableSlots([]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="booking-form-container"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '2rem',
        borderRadius: '0.5rem',
        color: 'white',
      }}
    >
      <div
        className="form-overlay"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '2rem',
          borderRadius: '0.5rem',
          backdropFilter: 'blur(5px)',
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Book Your Room</h2>

        {/* Success message */}
        {success && (
          <div className="bg-green-900 bg-opacity-80 text-green-100 p-4 rounded-md mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-900 bg-opacity-80 text-red-100 p-4 rounded-md mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="room" className="block text-lg font-medium mb-2">
              Select a Venue
            </label>
            <select
              id="room"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full p-3 border border-gray-700 rounded-md bg-black bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose a room --</option>
              {rooms.map((room) => (
                <option key={room} value={room} className="bg-gray-800">
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-lg font-medium mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-700 rounded-md bg-black bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="timeSlot"
              className="block text-lg font-medium mb-2"
            >
              Available Time Slots
            </label>
            <select
              id="timeSlot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              className="w-full p-3 border border-gray-700 rounded-md bg-black bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.room || !formData.date || loading}
              required
            >
              <option value="">-- Select a time slot --</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot} className="bg-gray-800">
                  {slot}
                </option>
              ))}
            </select>
            {loading && (
              <p className="text-blue-300 mt-2 flex items-center">
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
                Loading available slots...
              </p>
            )}
            {!loading &&
              formData.room &&
              formData.date &&
              availableSlots.length === 0 && (
                <p className="text-yellow-300 mt-2">
                  No slots available for this room on the selected date.
                </p>
              )}
          </div>

          <button
            type="submit"
            disabled={
              loading || !formData.room || !formData.date || !formData.timeSlot
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-gray-600 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                Processing...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
