import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import backgroundImage from '../assets/lecture-hall.jpg';

const RequestHistory = () => {
  // Define colors explicitly to match Announcement/Timetable component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const endpoint =
        user.role === 'student'
          ? '/api/requests/student'
          : '/api/requests/lecturer/history';

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('RequestHistory: Response:', response.data);
        setRequests(response.data);
      } catch (err) {
        console.error('RequestHistory: Fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(
          err.response?.data?.message || 'Failed to load request history'
        );
        toast.error(
          err.response?.data?.message || 'Failed to load request history'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'student' || user.role === 'lecturer')) {
      fetchRequests();
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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4 w-10 h-10 flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
                Request History
              </h2>
            </div>
            <div className="flex justify-center items-center p-8">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                style={{ borderColor: mediumBlueColor }}
              ></div>
              <span className="ml-3 text-xl text-gray-700">
                Loading requests...
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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="mr-4 w-10 h-10 flex-shrink-0">
                <div className="w-full h-full flex items-center justify-center">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
                Request History
              </h2>
            </div>
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p>{error}</p>
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="mr-4 w-10 h-10 flex-shrink-0">
              <div className="w-full h-full flex items-center justify-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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
              Request History
            </h2>
          </div>

          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                  style={{
                    borderColor: lightBlueColor,
                    backgroundColor: veryLightBlueColor,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: blueColor }}
                      >
                        {request.type}
                      </h3>
                      <p className="text-gray-700 mt-1">
                        Course: {request.course}
                      </p>
                      <p className="text-gray-700">
                        {user.role === 'student' ? 'Lecturer' : 'Student'}:{' '}
                        {user.role === 'student'
                          ? request.lecturer
                          : request.student}
                      </p>
                      <p className="text-gray-700">
                        Date:{' '}
                        {new Date(request.date).toLocaleDateString('en-ZA')}
                      </p>
                    </div>
                    <span
                      className={`inline-block text-sm px-3 py-1 rounded-full ${
                        request.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : request.status === 'Approved'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center text-gray-500 py-8 border rounded-lg"
              style={{ borderColor: lightBlueColor }}
            >
              <p className="text-lg">No requests found.</p>
            </div>
          )}
        </div>

        {/* Divider - Similar to Timetable component */}
        <div
          style={{
            borderTop: `1px solid ${lightBlueColor}`,
            marginTop: '2rem',
          }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div
            style={{ backgroundColor: veryLightBlueColor }}
            className="py-3 px-8 rounded-b-lg text-center"
          >
            <p className="text-sm text-gray-600">
              View your previous requests and check their current status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestHistory;
