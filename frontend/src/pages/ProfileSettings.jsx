import { useState, useEffect } from 'react';
  import axios from 'axios';

  const ProfileSettings = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [displayName, setDisplayName] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [currentAvatar, setCurrentAvatar] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    console.log('ProfileSettings: Initial render');

    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('ProfileSettings: No token found');
            setError('Please log in again');
            return;
          }

          console.log('ProfileSettings: Fetching user profile and courses');
          const [userResponse, coursesResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
              headers: { 'x-auth-token': token },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
              headers: { 'x-auth-token': token },
            }),
          ]);

          console.log('ProfileSettings: Fetched user profile:', JSON.stringify(userResponse.data, null, 2));
          console.log('ProfileSettings: Fetched courses:', JSON.stringify(coursesResponse.data, null, 2));

          setSelectedCourses(userResponse.data.courseCodes || []);
          setEmailNotifications(userResponse.data.notificationPreferences.emailNotifications);
          setDisplayName(userResponse.data.displayName || userResponse.data.name);
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
        }
      };
      fetchData();
    }, []);

    const handleCourseChange = (code) => {
      console.log('ProfileSettings: Course toggled:', code);
      setSelectedCourses((prev) =>
        prev.includes(code)
          ? prev.filter((c) => c !== code)
          : [...prev, code]
      );
    };

    const handleFileChange = (e) => {
      console.log('ProfileSettings: File selected:', e.target.files[0]?.name);
      setAvatar(e.target.files[0]);
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
          setError('Please log in again');
          return;
        }

        const formData = new FormData();
        formData.append('courseCodes', JSON.stringify(selectedCourses));
        formData.append('emailNotifications', emailNotifications);
        formData.append('displayName', displayName);
        if (avatar) {
          formData.append('avatar', avatar);
        }

        console.log('ProfileSettings: Sending form data');
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          formData,
          {
            headers: {
              'x-auth-token': token,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('ProfileSettings: Updated profile:', JSON.stringify(response.data, null, 2));
        setSuccess('Profile updated successfully!');
        setCurrentAvatar(
          response.data.avatar && response.data.avatar.startsWith('http')
            ? response.data.avatar
            : response.data.avatar
              ? `${import.meta.env.VITE_API_URL}/${response.data.avatar}`
              : 'https://placehold.co/100x100'
        );
      } catch (err) {
        console.error('ProfileSettings: Error updating profile:', err);
        setError(err.response?.data?.msg || 'Error updating profile');
      }
    };

    return (
      <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Profile Settings</h2>
          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-600 text-white p-3 rounded mb-4">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Select Courses</h3>
              {courses.length === 0 ? (
                <p className="text-gray-400">No courses available</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {courses.map((course) => (
                    <label key={course.code} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.code)}
                        onChange={() => handleCourseChange(course.code)}
                        className="mr-2"
                      />
                      {course.code} - {course.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => {
                    console.log('ProfileSettings: Email notifications toggled:', e.target.checked);
                    setEmailNotifications(e.target.checked);
                  }}
                  className="mr-2"
                />
                Receive email notifications for timetable changes
              </label>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Display Name</h3>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  console.log('ProfileSettings: Display name changed:', e.target.value);
                  setDisplayName(e.target.value);
                }}
                placeholder="Enter display name"
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                maxLength={50}
              />
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
              {currentAvatar && (
                <div className="mb-4">
                  <img
                    src={currentAvatar}
                    alt="Profile avatar"
                    className="w-32 h-32 object-cover rounded-full"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
              <p className="text-gray-400 text-sm mt-1">
                JPEG or PNG, max 5MB
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded transition duration-150"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    );
  };

  export default ProfileSettings;