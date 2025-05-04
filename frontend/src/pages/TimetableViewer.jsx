import { useState, useEffect, useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import axios from 'axios';

  const TimetableViewer = () => {
    const { user } = useContext(AuthContext);
    const [timetables, setTimetables] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log('TimetableViewer: Component mounted');
    console.log('TimetableViewer: User:', JSON.stringify(user, null, 2));

    useEffect(() => {
      const fetchTimetable = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          console.log('TimetableViewer: Token:', token);
          console.log('TimetableViewer: API URL:', `${import.meta.env.VITE_API_URL}/api/timetable`);
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable`, {
            headers: { 'x-auth-token': token },
          });
          console.log('TimetableViewer: Fetched timetable:', response.data);
          setTimetables(response.data);
          setError(null);
        } catch (err) {
          console.error('TimetableViewer: Error fetching timetable:', err);
          console.error('TimetableViewer: Error response:', err.response?.data);
          setError(err.response?.data?.msg || 'Failed to load timetable. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      if (user && (user.role === 'student' || user.role === 'lecturer')) {
        fetchTimetable();
      }
    }, [user]);

    if (!user) {
      return <div className="text-white text-center mt-8">Please log in to view your timetable.</div>;
    }

    if (user.role !== 'student' && user.role !== 'lecturer') {
      return <div className="text-white text-center mt-8">Access denied. Students and lecturers only.</div>;
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const isRoomUnderMaintenance = (room) => {
      if (!room.maintenance || room.maintenance.length === 0) return false;
      const now = new Date();
      return room.maintenance.some(
        (m) => new Date(m.startDate) <= now && new Date(m.endDate) >= now
      );
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Your Timetable</h1>
        {error && (
          <div className="bg-red-900 text-white p-3 rounded mb-4">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : timetables.length === 0 ? (
          <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center text-white">
            <p className="text-xl">No classes scheduled.</p>
          </div>
        ) : (
          <div className="bg-gray-900 bg-opacity-70 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black bg-opacity-50 rounded-lg">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Day</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Course</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Room</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Time</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {timetables.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4">{entry.day}</td>
                      <td className="px-6 py-4">{entry.courseName}</td>
                      <td className="px-6 py-4">{entry.roomId?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {isRoomUnderMaintenance(entry.roomId) ? (
                          <span className="text-red-500">Room under maintenance</span>
                        ) : (
                          <span className="text-green-500">Active</span>
                        )}
                      </td>
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