import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(
    'https://placehold.co/100x100'
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('ProfileSettings: No token found');
          throw new Error('Please log in again');
        }

        const [userResponse, coursesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProfile(userResponse.data);
        setSelectedCourses(userResponse.data.courseCodes || []);
        setEmailNotifications(
          userResponse.data.notificationPreferences?.emailNotifications ?? true
        );
        setDisplayName(
          userResponse.data.displayName ||
            `${userResponse.data.firstName} ${userResponse.data.lastName}`
        );
        setCurrentAvatar(
          userResponse.data.avatar &&
            userResponse.data.avatar.startsWith('http')
            ? userResponse.data.avatar
            : userResponse.data.avatar
            ? `${import.meta.env.VITE_API_URL}/${userResponse.data.avatar}`
            : 'https://placehold.co/100x100'
        );
        setCourses(coursesResponse.data);
      } catch (err) {
        console.error('ProfileSettings: Error fetching data:', err);
        setError(err.response?.data?.msg || 'Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleCourseChange = (code) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in again');
      }

      const formData = new FormData();
      formData.append('courseCodes', JSON.stringify(selectedCourses));
      formData.append('emailNotifications', emailNotifications);
      formData.append('displayName', displayName);
      if (avatar) formData.append('avatar', avatar);

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccess('Profile updated successfully!');
      setProfile(response.data);
      setCurrentAvatar(
        response.data.avatar && response.data.avatar.startsWith('http')
          ? response.data.avatar
          : response.data.avatar
          ? `${import.meta.env.VITE_API_URL}/${response.data.avatar}`
          : 'https://placehold.co/100x100'
      );

      if (messagesRef.current) {
        messagesRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      setTimeout(() => navigate('/timetable'), 1000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating profile');
      if (messagesRef.current) {
        messagesRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-700">
            Please log in to view profile settings.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-black mb-4">
              Profile Settings
            </h1>

            <div ref={messagesRef}>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
                  {success}
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-xl text-gray-700">
                  Loading profile...
                </span>
              </div>
            ) : profile ? (
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      style={{ color: '#2563EB' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Name</p>
                      <p className="text-gray-900 font-medium">
                        {profile.firstName} {profile.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="text-gray-900 font-medium">
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Role</p>
                      <p className="text-gray-900 font-medium capitalize">
                        {profile.role}
                      </p>
                    </div>
                  </div>
                </div>

                {user.role === 'student' && (
                  <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="space-y-8"
                  >
                    {/* Course Selection */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        Select Courses
                      </h2>

                      {courses.length === 0 ? (
                        <p className="text-gray-500">No courses available</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 bg-white rounded-lg border border-gray-200">
                          {courses.map((course) => (
                            <label
                              key={course.code}
                              className="flex items-center space-x-2 text-gray-700"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCourses.includes(course.code)}
                                onChange={() => handleCourseChange(course.code)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span>
                                {course.code} - {course.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                        Notification Preferences
                      </h2>
                      <label className="flex items-center space-x-2 text-gray-700">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) =>
                            setEmailNotifications(e.target.checked)
                          }
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span>
                          Receive email notifications for timetable changes
                        </span>
                      </label>
                    </div>

                    {/* Display Name */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Display Name
                      </h2>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter display name"
                        maxLength={50}
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Profile Picture */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Profile Picture
                      </h2>
                      {currentAvatar && (
                        <div className="mb-4 flex justify-center">
                          <img
                            src={currentAvatar}
                            alt="Profile avatar"
                            className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                          />
                        </div>
                      )}
                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Upload new image
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-lg text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        <p className="text-gray-500 text-sm mt-2">
                          JPEG or PNG, max 5MB
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out shadow-md flex items-center justify-center"
                      style={{ backgroundColor: '#2563EB' }}
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </button>
                  </form>
                )}

                {user.role === 'admin' && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-black mb-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        />
                      </svg>
                      Admin Controls
                    </h2>
                    <p className="text-gray-700 mb-4">
                      Manage system settings and users.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link
                        to="/admin/users"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors shadow-md flex items-center justify-center"
                        style={{ backgroundColor: '#2563EB' }}
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Manage Users
                      </Link>
                      <Link
                        to="/admin/maintenance"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors shadow-md flex items-center justify-center"
                        style={{ backgroundColor: '#2563EB' }}
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        View Maintenance Reports
                      </Link>
                      <Link
                        to="/admin/rooms"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors shadow-md flex items-center justify-center"
                        style={{ backgroundColor: '#2563EB' }}
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        Manage Rooms
                      </Link>
                      <Link
                        to="timetables"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition-colors shadow-md flex items-center justify-center"
                        style={{ backgroundColor: '#2563EB' }}
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
                        Manage Timetables
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700 text-center">
                No profile data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
