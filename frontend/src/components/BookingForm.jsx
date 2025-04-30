import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const BookingForm = () => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    room: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch rooms for dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/rooms`, {
          headers: { 'x-auth-token': token },
        });
        setRooms(response.data);
        console.log('BookingForm: Fetched rooms:', response.data);
      } catch (err) {
        toast.error('Failed to fetch rooms');
        console.error('BookingForm: Fetch rooms error:', err);
      }
    };
    fetchRooms();
  }, []);

  // Fetch available slots when room or date changes
  useEffect(() => {
    if (formData.room && formData.date) {
      const fetchSlots = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/available`, {
            params: { room: formData.room, date: formData.date },
            headers: { 'x-auth-token': token },
          });
          setAvailableSlots(response.data);
          console.log('BookingForm: Available slots:', response.data);
        } catch (err) {
          toast.error('Failed to fetch available slots');
          console.error('BookingForm: Fetch slots error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSlots();
    }
  }, [formData.room, formData.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'timeSlot') {
      const [startTime, endTime] = value.split('-').map((time) => {
        const [hours, minutes] = time.split(':');
        const date = new Date(formData.date);
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return date.toISOString();
      });
      setFormData({ ...formData, startTime, endTime });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, formData, {
        headers: { 'x-auth-token': token },
      });
      toast.success('Booking created successfully');
      console.log('BookingForm: Booking created:', response.data);
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create booking');
      console.error('BookingForm: Create booking error:', err);
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
                <option key={room._id} value={room.name} className="bg-gray-800">
                  {room.name} (Capacity: {room.capacity})
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
            <label htmlFor="timeSlot" className="block text-lg font-medium mb-2">
              Available Time Slots
            </label>
            <select
              id="timeSlot"
              name="timeSlot"
              value={`${formData.startTime && formData.endTime ? `${new Date(formData.startTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Johannesburg' })}-${new Date(formData.endTime).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Johannesburg' })}` : ''}`}
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
            disabled={loading || !formData.room || !formData.date || !formData.startTime || !formData.endTime}
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