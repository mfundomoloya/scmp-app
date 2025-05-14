import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const LecturerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    courseId: '',
    room: '',
    date: '',
    startTime: '',
    endTime: '',
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    courseId: '',
    isCampusWide: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        console.error('LecturerDashboard: No token found');
        setError('Please log in again');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch courses
        const coursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(coursesRes.data);
        console.log('LecturerDashboard: Courses response:', coursesRes.data);

        // Fetch upcoming classes
        const timetableRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/lecturer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('LecturerDashboard: Timetable response:', timetableRes.data);
        const timetableData = Array.isArray(timetableRes.data.timetables)
          ? timetableRes.data.timetables
          : [];
        const upcoming = timetableData
          .map(t => {
            if (!t.courseId?.code || !t.subject || !t.roomId?.name || !t.startTime || !t.endTime) {
              console.warn('Invalid timetable entry:', t);
              return null;
            }
            const start = new Date(t.startTime).toLocaleTimeString('en-ZA', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const end = new Date(t.endTime).toLocaleTimeString('en-ZA', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            return {
              id: t._id,
              course: t.courseId.code,
              title: t.subject,
              time: `${t.day}, ${start}-${end}`,
              room: t.roomId.name,
              students: t.userIds?.length || 0,
            };
          })
          .filter(t => t !== null)
          .slice(0, 2);
        setUpcomingClasses(upcoming);

        // Fetch pending requests
        const requestsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/requests/lecturer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('LecturerDashboard: Requests response:', requestsRes.data);
        setPendingRequests(requestsRes.data.slice(0, 2));

        // Fetch available rooms
        const roomsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/rooms/available`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { date: new Date().toISOString().split('T')[0] },
        });
        console.log('LecturerDashboard: Rooms response:', roomsRes.data);
        setAvailableRooms(roomsRes.data);

        // Fetch lecturer's bookings
        const bookingsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/lecturer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('LecturerDashboard: Bookings response:', bookingsRes.data);
        setBookings(bookingsRes.data.slice(0, 2));

        // Fetch lecturer's announcements
        const announcementsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements/lecturer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('LecturerDashboard: Announcements response:', announcementsRes.data);
        setAnnouncements(announcementsRes.data.slice(0, 2));
      } catch (err) {
        console.error('LecturerDashboard: Fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          endpoint: err.config?.url,
        });
        setError(err.response?.data?.msg || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'lecturer') {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (bookingForm.room && bookingForm.date) {
      const fetchSlots = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/available`, {
            params: { room: bookingForm.room, date: bookingForm.date },
            headers: { Authorization: `Bearer ${token}` },
          });
          setAvailableSlots(response.data);
          console.log('LecturerDashboard: Available slots:', response.data);
        } catch (err) {
          toast.error('Failed to fetch available slots');
          console.error('LecturerDashboard: Fetch slots error:', err);
        }
      };
      fetchSlots();
    }
  }, [bookingForm.room, bookingForm.date]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (name === 'timeSlot') {
      const selectedSlot = availableSlots[0]?.availableSlots.find(
        (slot) => slot.startTime === value
      );
      if (selectedSlot) {
        setBookingForm({
          ...bookingForm,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        });
      }
    } else {
      setBookingForm({ ...bookingForm, [name]: value });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.courseId || !bookingForm.room || !bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        courseId: bookingForm.courseId,
        room: bookingForm.room,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
      };
      await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings/lecturer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookingsRes.data.slice(0, 2));
      setBookingForm({ courseId: '', room: '', date: '', startTime: '', endTime: '' });
      setAvailableSlots([]);
      toast.success('Booking confirmed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(bookings.filter(b => b._id !== bookingId));
      toast.success('Booking cancelled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to cancel booking');
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/requests/${requestId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingRequests(pendingRequests.filter(r => r.id !== requestId));
      toast.success(`Request ${status.toLowerCase()} successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.msg || `Failed to ${status.toLowerCase()} request`);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/announcements`, announcementForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const announcementsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements/lecturer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(announcementsRes.data.slice(0, 2));
      setAnnouncementForm({ title: '', content: '', courseId: '', isCampusWide: false });
      toast.success('Announcement posted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to post announcement');
    }
  };

  return (
    <div className="min-h-screen relative pt-16">
      <div
        className="fixed inset-0 top-16 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url(/src/assets/lecture-hall.jpg)',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          {!isLoading && !error && (
            <>
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-black mb-4">
                  {user ? `Welcome, ${user.name}` : 'Lecturer Dashboard'}
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  Manage your classes, bookings, announcements, and student requests all in one place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/bookings"
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
                    Book a Room
                  </Link>
                  <Link
                    to="/timetable"
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    View Schedule
                  </Link>
                  <Link
                    to="/requests"
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
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    My Requests
                  </Link>
                  <Link
                    to="/announcements/new"
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
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                      />
                    </svg>
                    Post Announcement
                  </Link>
                  <Link
                    to="/maintenance/new"
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
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Report Issue
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Upcoming Classes to Teach
                    </h2>
                    {upcomingClasses.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="bg-gray-50 rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200"
                            style={{ borderLeftColor: '#2563EB' }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-black">
                                  {classItem.course}: {classItem.title}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                  {classItem.time} • {classItem.students} students
                                </p>
                              </div>
                              <span
                                className="inline-block text-sm px-3 py-1 rounded-full"
                                style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}
                              >
                                {classItem.room}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No upcoming classes found.</p>
                        <Link
                          to="/timetable"
                          className="mt-2 inline-block hover:underline"
                          style={{ color: '#2563EB' }}
                        >
                          View full schedule
                        </Link>
                      </div>
                    )}
                    <div className="mt-6 text-right">
                      <Link
                        to="/timetable"
                        className="flex items-center justify-end font-medium"
                        style={{ color: '#2563EB' }}
                      >
                        View Full Schedule
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
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
                      Classroom Bookings
                    </h2>
                    <form onSubmit={handleBookingSubmit} className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Course</label>
                          <select
                            name="courseId"
                            value={bookingForm.courseId}
                            onChange={handleBookingChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Course</option>
                            {courses.map(course => (
                              <option key={course._id} value={course._id}>
                                {course.code} - {course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Room</label>
                          <select
                            name="room"
                            value={bookingForm.room}
                            onChange={handleBookingChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select Room</option>
                            {availableRooms.map(room => (
                              <option key={room.roomId} value={room.roomName}>{room.roomName}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date</label>
                          <input
                            type="date"
                            name="date"
                            value={bookingForm.date}
                            onChange={handleBookingChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                          <select
                            name="timeSlot"
                            value={bookingForm.startTime}
                            onChange={handleBookingChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            disabled={!bookingForm.room || !bookingForm.date}
                            required
                          >
                            <option value="">Select Time Slot</option>
                            {availableSlots[0]?.availableSlots?.map(slot => (
                              <option key={slot.startTime} value={slot.startTime}>
                                {slot.startTime} - {slot.endTime}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        style={{ backgroundColor: '#2563EB' }}
                        disabled={!bookingForm.courseId || !bookingForm.room || !bookingForm.date || !bookingForm.startTime}
                      >
                        Book Classroom
                      </button>
                    </form>
                    <h3 className="text-lg font-semibold text-black mb-4">My Bookings</h3>
                    {bookings.length > 0 ? (
                      <div className="space-y-3">
                        {bookings.map(booking => (
                          <div
                            key={booking._id}
                            className="bg-gray-50 rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200"
                            style={{ borderLeftColor: '#2563EB' }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-black">
                                  {booking.courseId?.code || 'N/A'}: {booking.courseId?.name || 'No Course'}
                                </h4>
                                <p className="text-gray-600 mt-1">
                                  {booking.room} | {new Date(booking.date).toLocaleDateString('en-ZA')} | {booking.startTime} - {booking.endTime} | {booking.status}
                                </p>
                              </div>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No bookings found.</p>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
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
                      Quick Links
                    </h2>
                    <div className="flex flex-col space-y-2">
                      <Link
                        to="/bookings"
                        className="flex items-center p-2 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        My Bookings
                      </Link>
                      <Link
                        to="/requests"
                        className="flex items-center p-2 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
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
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                        My Requests
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center p-2 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile Settings
                      </Link>
                      <Link
                        to="/maintenance/report"
                        className="flex items-center p-2 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Maintenance Reports
                      </Link>
                      <Link
                        to="/grades"
                        className="flex items-center p-2 rounded-lg text-black hover:bg-blue-50 transition-colors duration-200"
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Manage Grades
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
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
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      Pending Requests
                    </h2>
                    {pendingRequests.length > 0 ? (
                      <div className="space-y-3">
                        {pendingRequests.map(request => (
                          <div
                            key={request.id}
                            className="border-b border-gray-200 pb-3 last:border-b-0"
                          >
                            <h3 className="font-medium text-black hover:text-blue-600 cursor-pointer">
                              {request.type}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {request.student} • {request.date}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleRequestAction(request.id, 'Approved')}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRequestAction(request.id, 'Rejected')}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No pending requests.</p>
                    )}
                    <div className="mt-4 text-right">
                      <Link
                        to="/requests"
                        className="flex items-center justify-end font-medium"
                        style={{ color: '#2563EB' }}
                      >
                        View Request History
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
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
                          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                        />
                      </svg>
                      Post Announcement
                    </h2>
                    <form onSubmit={handleAnnouncementSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={announcementForm.title}
                            onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Content</label>
                          <textarea
                            value={announcementForm.content}
                            onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                            required
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Course</label>
                          <select
                            value={announcementForm.courseId}
                            onChange={e => setAnnouncementForm({ ...announcementForm, courseId: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Course (or Campus-Wide)</option>
                            {courses.map(course => (
                              <option key={course._id} value={course._id}>
                                {course.code} - {course.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={announcementForm.isCampusWide}
                              onChange={e => setAnnouncementForm({ ...announcementForm, isCampusWide: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">Campus-Wide (requires authorization)</span>
                          </label>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        style={{ backgroundColor: '#2563EB' }}
                      >
                        Post Announcement
                      </button>
                    </form>
                    <h3 className="text-lg font-semibold text-black mt-6 mb-4">Recent Announcements</h3>
                    {announcements.length > 0 ? (
                      <div className="space-y-3">
                        {announcements.map(announcement => (
                          <div key={announcement._id} className="border-b border-gray-200 pb-3 last:border-b-0">
                            <h3 className="font-medium text-black">{announcement.title}</h3>
                            <p className="text-sm text-gray-500">
                              {announcement.courseId?.code || 'Campus-Wide'} | {new Date(announcement.createdAt).toLocaleDateString('en-ZA')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent announcements.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;