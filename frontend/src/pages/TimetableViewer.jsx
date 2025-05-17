import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import backgroundImage from '../assets/timeTable.jpg';

const TimetableViewer = () => {
  const blueColor = '#1d4ed8'; // blue-700
  const lightBlueColor = '#dbeafe'; // blue-100
  const veryLightBlueColor = '#eff6ff'; // blue-50
  const mediumBlueColor = '#2563eb'; // blue-600

  const { user } = useContext(AuthContext);
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
 const fetchTimetables = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching timetables for user:', user?.email, 'role:', user?.role);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/timetable`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            params: { timestamp: Date.now() },
          }
        );
        console.log('Timetables response:', JSON.stringify(response.data, null, 2));
        // FIX: Use response.data directly if it's an array
        const fetchedTimetables = Array.isArray(response.data)
          ? response.data
          : [];
        if (fetchedTimetables.length === 0) {
          console.warn('No timetables found for user:', user?.email);
        }
        setTimetables(fetchedTimetables);
      } catch (err) {
        console.error('Fetch timetables error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to fetch timetables. Please try again.');
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
      <div className="relative py-6">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-white bg-opacity-90"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4 w-16 h-16 flex-shrink-0 hidden md:block">
                <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={blueColor}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h2
                className="text-2xl font-bold pb-2"
                style={{
                  color: blueColor,
                  borderBottom: `1px solid ${lightBlueColor}`,
                }}
              >
                My Timetable
              </h2>
            </div>
            <div className="flex justify-center items-center p-8">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                style={{ borderColor: mediumBlueColor }}
              ></div>
              <span className="ml-3 text-xl text-gray-700">
                Loading timetable...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative py-6">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-white bg-opacity-90"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4 w-16 h-16 flex-shrink-0 hidden md:block">
                <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={blueColor}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h2
                className="text-2xl font-bold pb-2"
                style={{
                  color: blueColor,
                  borderBottom: `1px solid ${lightBlueColor}`,
                }}
              >
                My Timetable
              </h2>
            </div>
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p>{error}</p>
              <p className="mt-2 text-sm">
                If this issue persists, please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-6">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="mr-4 w-16 h-16 flex-shrink-0 hidden md:block">
              <div className="w-full h-full flex items-center justify-center bg-blue-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={blueColor}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h2
              className="text-2xl font-bold pb-2"
              style={{
                color: blueColor,
                borderBottom: `1px solid ${lightBlueColor}`,
              }}
            >
              My Timetable
            </h2>
          </div>

          {timetables.length === 0 ? (
            <div
              className="text-center text-gray-500 py-8 border rounded-lg"
              style={{ borderColor: lightBlueColor }}
            >
              <p className="text-lg">
                No timetable entries available. Please ensure you are enrolled in courses or contact your administrator.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Debug: User email: {user?.email}, Role: {user?.role}
              </p>
            </div>
          ) : (
            <div
              className="overflow-x-auto rounded-lg shadow-md"
              style={{ border: `1px solid ${lightBlueColor}` }}
            >
              <table className="min-w-full">
                <thead>
                  <tr style={{ backgroundColor: veryLightBlueColor }}>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Day
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ divideColor: lightBlueColor }}
                >
                  {timetables.map((timetable) => (
                    <tr
                      key={timetable._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-700">
                        {timetable.courseId?.code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {timetable.subject || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {timetable.roomId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {timetable.day || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {timetable.startTime && timetable.endTime ? (
                          <>
                            {new Date(timetable.startTime).toLocaleTimeString(
                              'en-ZA',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              }
                            )}{' '}
                            -{' '}
                            {new Date(timetable.endTime).toLocaleTimeString(
                              'en-ZA',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              }
                            )}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: `1px solid ${lightBlueColor}`,
            marginTop: '2rem',
          }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div
            style={{ backgroundColor: veryLightBlueColor }}
            className="py-3 px-8 rounded-b-lg text-center"
          >
            <p className="text-sm text-gray-600">
              View your class schedule based on your enrolled courses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableViewer;