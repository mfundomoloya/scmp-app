import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      try {
        // Fetch timetables
        const timetableRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('StudentDashboard: Timetable response:', timetableRes.data);

        // Extract timetables array from response
        const timetableData = Array.isArray(timetableRes.data.timetables)
          ? timetableRes.data.timetables
          : [];

        // Map timetables (no date filter for debugging)
        const upcoming = timetableData
          .map(t => {
            // Validate required fields
            if (!t.courseId?.code || !t.subject || !t.roomId?.name || !t.day || !t.startTime || !t.endTime) {
              console.warn('Invalid timetable entry:', t);
              return null;
            }
            // Format time (e.g., "06:00-09:30")
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
              course: t.courseId.code, // e.g., "CS101"
              title: t.subject, // e.g., "Algorithms"
              time: `${t.day}, ${start}-${end}`, // e.g., "Thursday, 06:00-09:30"
              room: t.roomId.name, // e.g., "Seminar Room B"
            };
          })
          .filter(t => t !== null)
          .slice(0, 2); // Limit to 2 for display

        setUpcomingClasses(upcoming);

        // Fetch announcements
        const announcementRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('StudentDashboard: Announcement response:', announcementRes.data);

        // Ensure announcementRes.data is an array
        const announcementData = Array.isArray(announcementRes.data) ? announcementRes.data : [];

        // Filter for recent published announcements (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recent = announcementData
          .filter(a => a.isPublished && new Date(a.createdAt) >= sevenDaysAgo)
          .map(a => ({
            id: a._id,
            title: a.title,
            date: new Date(a.createdAt).toLocaleDateString('en-ZA', {
              day: 'numeric',
              month: 'short',
            }),
          }))
          .slice(0, 2); // Limit to 2 for display

        setRecentAnnouncements(recent);
      } catch (err) {
        console.error('StudentDashboard: Fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'student') {
      fetchData();
    }
  }, [user]);

  return (
    <div className="min-h-screen relative pt-16">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 top-16 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url(/src/assets/lecture-hall.jpg)',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Welcome Banner */}
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h1 className="text-3xl font-bold text-black mb-4">
                  {user ? `Welcome, ${user.name}` : 'Student Dashboard'}
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                  Access your classes, bookings, and maintenance reports all in one
                  place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/bookings/new"
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
                    View Timetable
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

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
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
                      Upcoming Classes
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
                                  {classItem.time}
                                </p>
                              </div>
                              <span
                                className="inline-block text-sm px-3 py-1 rounded-full"
                                style={{
                                  backgroundColor: '#EFF6FF',
                                  color: '#2563EB',
                                }}
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
                          to="/profile"
                          className="mt-2 inline-block hover:underline"
                          style={{ color: '#2563EB' }}
                        >
                          Update your course selection
                        </Link>
                      </div>
                    )}

                    <div className="mt-6 text-right">
                      <Link
                        to="/timetable"
                        className="flex items-center justify-end font-medium"
                        style={{ color: '#2563EB' }}
                      >
                        View Full Timetable
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
                </div>

                {/* Quick Links & Announcements */}
                <div className="space-y-6">
                  {/* Quick Links */}
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
                        My Maintenance Reports
                      </Link>
                    </div>
                  </div>

                  {/* Recent Announcements */}
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
                      Announcements
                    </h2>

                    {recentAnnouncements.length > 0 ? (
                      <div className="space-y-3">
                        {recentAnnouncements.map((announcement) => (
                          <Link
                            key={announcement.id}
                            to="/announcements"
                            className="block border-b border-gray-200 pb-3 last:border-b-0"
                          >
                            <h3 className="font-medium text-black hover:text-blue-600 transition-colors">
                              {announcement.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {announcement.date}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No recent announcements
                      </p>
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

export default StudentDashboard;