import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MaintenanceReportList = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  console.log('MaintenanceReportList: Rendering for user:', user?.id, 'role:', user?.role);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('MaintenanceReportList: Fetching reports with token:', token ? '[REDACTED]' : null);
      console.log('MaintenanceReportList: API URL:', import.meta.env.VITE_API_URL);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/maintenance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('MaintenanceReportList: Fetch response:', response.data);

      // Filter reports for students/lecturers
      const userReports = user.role !== 'admin'
        ? response.data.filter((report) => report.userId?._id === user.id || report.userId === user.id)
        : response.data;

      console.log('MaintenanceReportList: User reports:', userReports);
      setReports(userReports);
      setError(null);
    } catch (err) {
      console.error('MaintenanceReportList: Error fetching reports:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.msg || 'Failed to fetch maintenance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('MaintenanceReportList: Triggering fetchReports for user:', user.id);
      fetchReports();
    } else {
      console.log('MaintenanceReportList: No user, skipping fetchReports');
      setError('Please log in to view maintenance reports.');
    }
  }, [user]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return 'Invalid Date';
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-900 text-green-200';
      case 'open':
        return 'bg-yellow-900 text-yellow-200';
      case 'in-progress':
        return 'bg-green-900 text-green-200';
      default:
        return 'bg-gray-700 text-white';
    }
  };

  if (!user) {
    return <div className="text-white text-center mt-8">Please log in to view maintenance reports.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-900 bg-opacity-80 text-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold border-b border-gray-700 pb-4">
            My Maintenance Reports
          </h2>
          <Link
            to="/maintenance/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Report New Issue
          </Link>
        </div>

        {error && (
          <div className="bg-red-900 text-white p-4 rounded-md mb-6 flex justify-between items-center">
            <span>{error}</span>
            <div>
              <button
                onClick={fetchReports}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mr-2"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-xl">Loading reports...</span>
          </div>
        ) : reports.length === 0 && !error ? (
          <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl">No maintenance reports found.</p>
            <p className="text-gray-400 mt-2">
              You have not reported any maintenance issues yet. Click "Report New Issue" to start.
            </p>
            <p className="text-yellow-300 mt-2">
              Debug: User ID: {user.id}, Role: {user.role}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black bg-opacity-50 rounded-lg">
              <thead>
                <tr className="bg-gray-900 text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Reported On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-gray-800 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.roomId?.name || 'Unknown Room'}
                    </td>
                    <td className="px-6 py-4">
                      {report.description.length > 100
                        ? `${report.description.substring(0, 100)}...`
                        : report.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                           className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(report.status)}`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(report.createdAt)}
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

export default MaintenanceReportList;