import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import backgroundImage from '../assets/AnnouncementB.jpeg';
import timetableIcon from '../assets/timetable.jpg';

const Timetable = () => {
  // Define colors explicitly to match Announcement component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

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
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(
          'Timetable: Fetched user profile:',
          JSON.stringify(userResponse.data, null, 2)
        );
        const courseCodes = userResponse.data.courseCodes || [];

        if (courseCodes.length === 0) {
          setTimetable([]);
          return;
        }

        console.log('Timetable: Fetching timetable for courses:', courseCodes);
        const timetableResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/timetable`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { courseCodes: courseCodes.join(',') },
          }
        );

        console.log(
          'Timetable: Fetched timetable:',
          JSON.stringify(timetableResponse.data, null, 2)
        );
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
            <div className="text-center py-8">
              <p className="text-gray-700 text-lg">
                Please log in to view your timetable.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
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
                {timetableIcon ? (
                  <img
                    src={timetableIcon}
                    alt="Timetable"
                    className="w-full h-full object-contain"
                  />
                ) : (
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
                )}
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

  return (
    <div className="relative py-6">
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="mr-4 w-16 h-16 flex-shrink-0 hidden md:block">
              {timetableIcon ? (
                <img
                  src={timetableIcon}
                  alt="Timetable"
                  className="w-full h-full object-contain"
                />
              ) : (
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
              )}
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

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {timetable.length === 0 ? (
            <div
              className="text-center text-gray-500 py-8 border rounded-lg"
              style={{ borderColor: lightBlueColor }}
            >
              <p className="text-lg">
                No timetable entries available. Please select courses in your
                profile.
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
                  {timetable.map((entry, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-700">
                        {entry.course}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {entry.subject}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{entry.room}</td>
                      <td className="px-6 py-4 text-gray-700">{entry.day}</td>
                      <td className="px-6 py-4 text-gray-700">{entry.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Divider - Similar to Announcement component */}
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

export default Timetable;
