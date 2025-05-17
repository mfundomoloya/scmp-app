import { useState, useEffect, useContext } from 'react';
//import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { AuthContext } from '../context/AuthContext';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const errorHandler = (error) => {
      console.error('ErrorBoundary caught:', error);
      setHasError(true);
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);
  if (hasError) {
    return (
      <div className="text-red-300 text-center">
        Something went wrong. Please try again.
      </div>
    );
  }
  return children;
};

const BookingForm = ({ onBookingCreated }) => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    room: '',
    date: '',
    startTime: '',
    endTime: '',
    courseId: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate();

  // Fetch rooms and courses for dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(
          'BookingForm: Fetching data with token:',
          token ? '[REDACTED]' : null
        );

        // Fetch rooms
        const roomsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/rooms`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRooms(roomsResponse.data);
        console.log('BookingForm: Fetched rooms:', roomsResponse.data);

        // Fetch courses for lecturers
        if (user?.role === 'lecturer') {
          const coursesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/courses`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCourses(coursesResponse.data);
          console.log('BookingForm: Fetched courses:', coursesResponse.data);
        }
      } catch (err) {
        toast.error('Failed to fetch data');
        console.error('BookingForm: Fetch data error:', err);
      }
    };
    fetchData();
  }, [user]);

  // Fetch available slots when room or date changes
  useEffect(() => {
    if (formData.room && formData.date) {
      const fetchSlots = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          console.log(
            'BookingForm: Fetching slots with token:',
            token ? '[REDACTED]' : null
          );
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/bookings/available`,
            {
              params: { room: formData.room, date: formData.date },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
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
      const selectedSlot = availableSlots[0]?.availableSlots.find(
        (slot) => slot.startTime === value
      );
      if (selectedSlot) {
        setFormData({
          ...formData,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.room ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (user?.role === 'lecturer' && !formData.courseId) {
      toast.error('Please select a course');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const bookingData = {
        room: formData.room,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        ...(user?.role === 'lecturer' && { courseId: formData.courseId }),
      };
      console.log('BookingForm: Submitting booking:', bookingData);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bookings`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Booking created successfully');
      console.log('BookingForm: Booking created:', response.data);
      if (onBookingCreated) onBookingCreated();
      setFormData({
        room: '',
        date: '',
        startTime: '',
        endTime: '',
        courseId: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create booking');
      console.error('BookingForm: Create booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (slot) => {
    try {
      // Check if the time is already in HH:mm format
      if (slot.startTime.includes(':') && !slot.startTime.includes('T')) {
        return `${slot.startTime}-${slot.endTime}`;
      }

      // Otherwise, try to parse ISO format
      const start = format(parseISO(slot.startTime), 'HH:mm', {
        timeZone: 'Africa/Johannesburg',
      });
      const end = format(parseISO(slot.endTime), 'HH:mm', {
        timeZone: 'Africa/Johannesburg',
      });
      return `${start}-${end}`;
    } catch (error) {
      console.error('Error formatting time slot:', error, slot);
      // Fallback to returning the original values
      return `${slot.startTime}-${slot.endTime}`;
    }
  };

  return (
    <ErrorBoundary>
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
            backgroundColor: 'rgba(34, 59, 87, 0.7)',
            padding: '2rem',
            borderRadius: '0.5rem',
            backdropFilter: 'blur(5px)',
          }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Book Your Room
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {user?.role === 'lecturer' && (
              <div>
                <label
                  htmlFor="courseId"
                  className="block text-lg font-medium mb-2"
                >
                  Select Course
                </label>
                <select
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-700 rounded-md bg-black bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map((course) => (
                    <option
                      key={course._id}
                      value={course._id}
                      className="bg-gray-800"
                    >
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                  <option
                    key={room._id}
                    value={room.name}
                    className="bg-gray-800"
                  >
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
                min={format(new Date(), 'yyyy-MM-dd')}
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
                value={formData.startTime}
                onChange={handleChange}
                className="w-full p-3 border border-gray-700 rounded-md bg-black bg-opacity-50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.room || !formData.date || loading}
                required
              >
                <option value="">-- Select a time slot --</option>
                {availableSlots[0]?.availableSlots?.map((slot) => (
                  <option
                    key={slot.startTime}
                    value={slot.startTime}
                    className="bg-gray-800"
                  >
                    {formatTimeSlot(slot)}
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
                (!availableSlots[0]?.availableSlots ||
                  availableSlots[0].availableSlots.length === 0) && (
                  <p className="text-yellow-300 mt-2">
                    No slots available for this room on the selected date.
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !formData.room ||
                !formData.date ||
                !formData.startTime ||
                !formData.endTime ||
                (user?.role === 'lecturer' && !formData.courseId)
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
    </ErrorBoundary>
  );
};

export default BookingForm;
