import { useState, useEffect, useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import axios from 'axios';

  const TimetableViewer = () => {
    const { user } = useContext(AuthContext);
    const [timetables, setTimetables] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log('TimetableViewer: Component mounted');
    console.log('TimetableViewer: User:', JSON.stringify(user, null, 2));

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          console.log('TimetableViewer: Fetching timetables and courses');
          const token = localStorage.getItem('token');
          const url = selectedCourse 
            ? `${import.meta.env.VITE_API_URL}/api/timetable/filter?courseCode=${selectedCourse}`
            : `${import.meta.env.VITE_API_URL}/api/timetable`;
          const [timetableResponse, courseResponse] = await Promise.all([
            axios.get(url, { headers: { 'x-auth-token': token } }),
            axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, { headers: { 'x-auth-token': token } }),
          ]);
          console.log('TimetableViewer: Fetched timetables:', timetableResponse.data);
          console.log('TimetableViewer: Fetched courses:', courseResponse.data);
          setTimetables(timetableResponse.data);
          setCourses(user.role === 'student' 
            ? courseResponse.data.filter(c => user.courseCodes?.includes(c.code))
            : courseResponse.data);
          setError(null);
        } catch (err) {
          console.error('TimetableViewer: Error fetching timetables:', err);
          setError(err.response?.data?.msg || 'Failed to load timetable. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      if (user) {
        fetchData();
      }
    }, [user, selectedCourse]);

    if (!user) {
      return <div className="text-white text-center mt-8">Please log in to view your timetable.</div>;
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Your Timetable</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full max-w-xs rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course.code}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>
        {error && (
          <div className="bg-red-900 text-white p-3 rounded mb-4">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : timetables.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center text-white">
            <p className="text-xl">No timetable entries found.</p>
          </div>
        ) : (
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black bg-opacity-50 rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Day</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Course</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Subject</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Room</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Time</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {timetables.map((timetable) => (
                    <tr key={timetable._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4">{timetable.day}</td>
                      <td className="px-6 py-4">{timetable.courseId?.code}</td>
                      <td className="px-6 py-4">{timetable.subject}</td>
                      <td className="px-6 py-4">{timetable.roomId?.name}</td>
                      <td className="px-6 py-4">
                        {new Date(timetable.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(timetable.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">{timetable.roomId?.maintenance?.length > 0 ? 'Maintenance' : 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default TimetableViewer;