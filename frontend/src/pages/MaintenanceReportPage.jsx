import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import backgroundImage from '../assets/Maintenance.jpg';

const MaintenanceReportPage = () => {
  // Define colors explicitly to match Announcement/Timetable component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  const { user } = useContext(AuthContext);
  const [maintenanceReports, setMaintenanceReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    roomId: '',
    description: '',
    urgency: 'low',
    reportType: 'repair',
  });
  const [rooms, setRooms] = useState([]);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching maintenance data for user:', user?.email);
        // Fetch rooms for dropdown
        const roomsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/rooms`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        // Fetch maintenance reports
        const reportsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/maintenance`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        console.log('Rooms fetched:', roomsResponse.data);
        console.log('Maintenance reports fetched:', reportsResponse.data);

        setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : []);
        setMaintenanceReports(
          Array.isArray(reportsResponse.data) ? reportsResponse.data : []
        );
      } catch (err) {
        console.error('Fetch data error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to fetch maintenance data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
      setError('Please log in to access maintenance reports');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/maintenance`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      console.log('Maintenance report submitted:', response.data);
      setMaintenanceReports([response.data, ...maintenanceReports]);
      setSuccess('Maintenance report submitted successfully');
      setFormData({
        roomId: '',
        description: '',
        urgency: 'low',
        reportType: 'repair',
      });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Submit report error:', err);
      setError(
        err.response?.data?.msg || 'Failed to submit maintenance report'
      );
      setTimeout(() => setError(null), 5000);
    }
  };

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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
                Maintenance Reports
              </h2>
            </div>
            <div className="flex justify-center items-center p-8">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                style={{ borderColor: mediumBlueColor }}
              ></div>
              <span className="ml-3 text-xl text-gray-700">
                Loading maintenance data...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !maintenanceReports.length) {
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
                Maintenance Reports
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
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
              Maintenance Reports
            </h2>
          </div>

          {success && (
            <div
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
              role="alert"
            >
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {/* Maintenance Report Form */}
          <div
            className="rounded-lg p-6 transition-all duration-300 shadow-md mb-8"
            style={{
              borderColor: lightBlueColor,
              backgroundColor: veryLightBlueColor,
              border: `1px solid ${lightBlueColor}`,
            }}
          >
            <h3
              className="text-xl font-semibold mb-6"
              style={{ color: blueColor }}
            >
              Submit Maintenance Report
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Room
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: lightBlueColor,
                    boxShadow: 'none',
                    focusRing: mediumBlueColor,
                  }}
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room._id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Issue Type
                </label>
                <select
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: lightBlueColor,
                    boxShadow: 'none',
                    focusRing: mediumBlueColor,
                  }}
                  required
                >
                  <option value="repair">Repair</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="replacement">Replacement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Urgency
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: lightBlueColor,
                    boxShadow: 'none',
                    focusRing: mediumBlueColor,
                  }}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: lightBlueColor,
                    boxShadow: 'none',
                    focusRing: mediumBlueColor,
                  }}
                  rows="4"
                  placeholder="Describe the issue in detail"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-medium rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: mediumBlueColor }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = blueColor)
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = mediumBlueColor)
                  }
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>

          {/* Maintenance Reports List */}
          <h3
            className="text-xl font-semibold mb-6"
            style={{ color: blueColor }}
          >
            Your Reports
          </h3>
          {maintenanceReports.length === 0 ? (
            <div
              className="text-center text-gray-500 py-8 border rounded-lg"
              style={{ borderColor: lightBlueColor }}
            >
              <p className="text-lg">
                You haven't submitted any maintenance reports yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceReports.map((report) => (
                <div
                  key={report._id}
                  className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md"
                  style={{
                    borderColor: lightBlueColor,
                    backgroundColor: veryLightBlueColor,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4
                          className="text-lg font-semibold"
                          style={{ color: blueColor }}
                        >
                          {report.roomId?.name || 'Room Not Specified'}
                        </h4>
                        <span
                           className={`text-xs px-3 py-1 rounded-full border ${
    report.urgency === 'critical'
      ? 'bg-red-100 text-red-800 border-red-300'
      : report.urgency === 'high'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : report.urgency === 'medium'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
      : 'bg-green-100 text-green-800 border-green-300'
  }`}
                        >
                         {report.urgency
    ? report.urgency.charAt(0).toUpperCase() + report.urgency.slice(1)
    : 'Unknown'}
</span>
<span className="text-xs px-3 py-1 rounded-full border bg-blue-100 text-blue-800 border-blue-300">
  {report.reportType
    ? report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)
    : 'Other'}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{report.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                          Submitted:{' '}
                          {new Date(report.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            report.status === 'completed'
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : report.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}
                        >
                          {report.status === 'completed'
                            ? 'Completed'
                            : report.status === 'in-progress'
                            ? 'In Progress'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider - Similar to Timetable component */}
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
              Report maintenance issues to keep our campus facilities in good
              condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceReportPage;
