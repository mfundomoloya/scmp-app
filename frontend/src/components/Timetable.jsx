import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Timetable = () => {
  const { user } = useContext(AuthContext);
  const [timetable, setTimetable] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('Timetable: Initial render');

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Timetable: No token found');
          throw new Error('Please log in again');
        }

        console.log('Timetable: Fetching user profile');
        const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Timetable: Fetched user profile:', JSON.stringify(userResponse.data, null, 2));
        const courseCodes = userResponse.data.courseCodes || [];

        if (courseCodes.length === 0) {
          setTimetable([]);
          return;
        }

        console.log('Timetable: Fetching timetable for courses:', courseCodes);
        const timetableResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { courseCodes: courseCodes.join(',') },
        });

        console.log('Timetable: Fetched timetable:', JSON.stringify(timetableResponse.data, null, 2));
        setTimetable(timetableResponse.data);
      } catch (err) {
        console.error('Timetable: Error fetching data:', err);
        setError(err.response?.data?.msg || 'Error fetching timetable');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTimetable();
  }, [user]);

  if (!user) {
    return <div className="text-white text-center mt-8">Please log in to view your timetable.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">My Timetable</h2>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-xl text-white">Loading timetable...</span>
          </div>
        ) : timetable.length === 0 ? (
          <p className="text-gray-400 text-center">No timetable entries available. Please select courses in your profile.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr className="bg-gray-900 text-left text-gray-300 uppercase text-sm">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Day</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {timetable.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-white">{entry.course}</td>
                    <td className="px-6 py-4 text-white">{entry.subject}</td>
                    <td className="px-6 py-4 text-white">{entry.room}</td>
                    <td className="px-6 py-4 text-white">{entry.day}</td>
                    <td className="px-6 py-4 text-white">{entry.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;