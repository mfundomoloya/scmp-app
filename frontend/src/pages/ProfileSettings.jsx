import { useState, useEffect, useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import axios from 'axios';

  const ProfileSettings = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log('ProfileSettings: Component mounted');
    console.log('ProfileSettings: User:', JSON.stringify(user, null, 2));

    // Fetch available courses and user's current courseCodes
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          console.log('ProfileSettings: Fetching courses and user profile');
          const token = localStorage.getItem('token');
          const [courseResponse, userResponse] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
              headers: { 'x-auth-token': token },
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
              headers: { 'x-auth-token': token },
            }),
          ]);
          console.log('ProfileSettings: Fetched courses:', courseResponse.data);
          console.log('ProfileSettings: Fetched user profile:', userResponse.data);
          setCourses(courseResponse.data);
          setSelectedCourses(userResponse.data.courseCodes || []);
          setError(null);
        } catch (err) {
          console.error('ProfileSettings: Error fetching data:', err);
          setError(err.response?.data?.msg || 'Failed to load data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      if (user) {
        fetchData();
      }
    }, [user]);

    // Handle course selection
    const handleCourseChange = (e) => {
      const courseCode = e.target.value;
      if (e.target.checked) {
        setSelectedCourses([...selectedCourses, courseCode]);
      } else {
        setSelectedCourses(selectedCourses.filter(code => code !== courseCode));
      }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        console.log('ProfileSettings: Updating course codes:', selectedCourses);
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          { courseCodes: selectedCourses },
          { headers: { 'x-auth-token': token } }
        );
        console.log('ProfileSettings: Updated profile:', response.data);
        setSuccess('Course codes updated successfully!');
      } catch (err) {
        console.error('ProfileSettings: Error updating profile:', err);
        setError(err.response?.data?.msg || 'Failed to update course codes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      return <div className="text-white text-center mt-8">Please log in to view your profile settings.</div>;
    }

    if (user.role !== 'student') {
      return <div className="text-white text-center mt-8">This page is for students only.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Profile Settings</h1>
        <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6 max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-white">Manage Course Codes</h2>
          {error && (
            <div className="bg-red-900 text-white p-3 rounded mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-900 text-white p-3 rounded mb-4">{success}</div>
          )}
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Courses</label>
                <div className="space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-gray-400">No courses available.</p>
                  ) : (
                    courses.map(course => (
                      <div key={course._id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={course.code}
                          checked={selectedCourses.includes(course.code)}
                          onChange={handleCourseChange}
                          className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
                        />
                        <label className="ml-2 text-white">{course.code} - {course.name}</label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  export default ProfileSettings;