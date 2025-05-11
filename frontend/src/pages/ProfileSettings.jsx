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
  const [currentAvatar, setCurrentAvatar] = useState('https://placehold.co/100x100');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  console.log('ProfileSettings: Initial render');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('ProfileSettings: No token found');
          throw new Error('Please log in again');
        }

        console.log('ProfileSettings: Fetching user profile and courses');
        const [userResponse, coursesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log('ProfileSettings: Fetched user profile:', JSON.stringify(userResponse.data, null, 2));
        console.log('ProfileSettings: Fetched courses:', JSON.stringify(coursesResponse.data, null, 2));

        setProfile(userResponse.data);
        setSelectedCourses(userResponse.data.courseCodes || []);
        setEmailNotifications(userResponse.data.notificationPreferences.emailNotifications);
        setDisplayName(userResponse.data.displayName || `${userResponse.data.firstName} ${userResponse.data.lastName}`);
        setCurrentAvatar(
          userResponse.data.avatar && userResponse.data.avatar.startsWith('http')
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
    console.log('ProfileSettings: Course toggled:', code);
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('ProfileSettings: File selected:', file?.name);
    setAvatar(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('ProfileSettings: Submitting form');
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('ProfileSettings: No token found');
        throw new Error('Please log in again');
      }

      const formData = new FormData();
      formData.append('courseCodes', JSON.stringify(selectedCourses));
      formData.append('emailNotifications', emailNotifications);
      formData.append('displayName', displayName);
      if (avatar) formData.append('avatar', avatar);

      console.log('ProfileSettings: Sending form data');
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

      console.log('ProfileSettings: Updated profile:', JSON.stringify(response.data, null, 2));
      setSuccess('Profile updated successfully!');
      setProfile(response.data);
      setCurrentAvatar(
        response.data.avatar && response.data.avatar.startsWith('http')
          ? response.data.avatar
          : response.data.avatar
            ? `${import.meta.env.VITE_API_URL}/${response.data.avatar}`
            : 'https://placehold.co/100x100'
      );

      // Scroll to the top where the success message is displayed
      if (messagesRef.current) {
        messagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Navigate to timetable to reflect updated courses
      setTimeout(() => navigate('/timetable'), 1000);
    } catch (err) {
      console.error('ProfileSettings: Error updating profile:', err);
      setError(err.response?.data?.msg || 'Error updating profile');
      if (messagesRef.current) {
        messagesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (!user) {
    return <div className="text-white text-center mt-8">Please log in to view profile settings.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Profile Settings</h2>

        <div ref={messagesRef}>
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-green-600 text-white p-4 rounded-lg mb-6">{success}</div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-xl text-white">Loading profile...</span>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
              <p className="text-gray-300">Name: {profile.firstName} {profile.lastName}</p>
              <p className="text-gray-300">Email: {profile.email}</p>
              <p className="text-gray-300">Role: {profile.role}</p>
            </div>

            {user.role === 'student' && (
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Select Courses</h3>
                    {courses.length === 0 ? (
                      <p className="text-gray-400">No courses available</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 bg-gray-800 rounded-lg">
                        {courses.map((course) => (
                          <label key={course.code} className="flex items-center space-x-2 text-gray-200">
                            <input
                              type="checkbox"
                              checked={selectedCourses.includes(course.code)}
                              onChange={() => handleCourseChange(course.code)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
                            />
                            <span>{course.code} - {course.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>
                    <label className="flex items-center space-x-2 text-gray-200">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => {
                          console.log('ProfileSettings: Email notifications toggled:', e.target.checked);
                          setEmailNotifications(e.target.checked);
                        }}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-700 rounded"
                      />
                      <span>Receive email notifications for timetable changes</span>
                    </label>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Display Name</h3>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        console.log('ProfileSettings: Display name changed:', e.target.value);
                        setDisplayName(e.target.value);
                      }}
                      placeholder="Enter display name"
                      maxLength={50}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Profile Picture</h3>
                    {currentAvatar && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={currentAvatar}
                          alt="Profile avatar"
                          className="w-32 h-32 object-cover rounded-full border-2 border-gray-700"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleFileChange}
                      className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    <p className="text-gray-400 text-sm mt-2">JPEG or PNG, max 5MB</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition duration-150 ease-in-out"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {user.role === 'admin' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Admin Controls</h3>
                <p className="text-gray-300 mb-4">Manage system settings and users.</p>
                <div className="space-y-4">
                  <Link
                    to="/admin/users"
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Manage Users
                  </Link>
                  <Link
                    to="/admin/maintenance"
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center"
                  >
                    View Maintenance Reports
                  </Link>
                  <Link
                    to="/admin/rooms"
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Manage Rooms
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No profile data available.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;