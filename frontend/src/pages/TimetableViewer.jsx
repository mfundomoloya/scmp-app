import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TimetableViewer = () => {
  const { user } = useContext(AuthContext);
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetables = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching timetables for user:', user?.email);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/timetable`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            params: { timestamp: Date.now() }, // Prevent cache
          }
        );
        console.log('Timetables response:', response.data);
        const fetchedTimetables = Array.isArray(response.data.timetables)
          ? response.data.timetables
          : [];
        setTimetables(fetchedTimetables);
      } catch (err) {
        console.error('Fetch timetables error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to fetch timetables');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTimetables();
    } else {
      setIsLoading(false);
      setError('Please log in to view timetables');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-600 text-white p-4 rounded-lg max-w-3xl w-full">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          My Timetable
        </h1>
        {timetables.length === 0 ? (
          <div className="bg-gray-800 p-4 rounded-lg text-gray-400 text-center">
            No timetables found. Please select courses in your profile.
          </div>
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
                {timetables.map((timetable) => (
                  <tr
                    key={timetable._id}
                    className="hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-white">
                      {timetable.courseId?.code || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {timetable.subject}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {timetable.roomId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-white">{timetable.day}</td>
                    <td className="px-6 py-4 text-white">
                      {new Date(timetable.startTime).toLocaleTimeString(
                        'en-ZA',
                        {
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}{' '}
                      -{' '}
                      {new Date(timetable.endTime).toLocaleTimeString('en-ZA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
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

export default TimetableViewer;
