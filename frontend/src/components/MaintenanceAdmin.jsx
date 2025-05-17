import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const MaintenanceAdmin = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    roomId: '',
    startDate: '',
    endDate: '',
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        console.log('MaintenanceAdmin: Fetching reports');
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/maintenance`,
          {
            headers: { 'x-auth-token': token },
          }
        );
        console.log('MaintenanceAdmin: Fetched reports:', response.data);
        setReports(response.data);
        setError(null);
      } catch (err) {
        console.error('MaintenanceAdmin: Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchReports();
    }
  }, [user]);

  const handleStatusChange = async (reportId, status) => {
    setLoading(true);
    try {
      console.log('MaintenanceAdmin: Updating status:', { reportId, status });
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/maintenance/${reportId}/status`,
        { status },
        { headers: { 'x-auth-token': token } }
      );
      console.log('MaintenanceAdmin: Status updated:', response.data);
      setReports(reports.map((r) => (r._id === reportId ? response.data : r)));
      setError(null);
    } catch (err) {
      console.error('MaintenanceAdmin: Error updating status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceFormChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('MaintenanceAdmin: Submitting maintenance:', maintenanceForm);
      console.log('MaintenanceAdmin: Token:', token);
      console.log(
        'MaintenanceAdmin: API URL:',
        `${import.meta.env.VITE_API_URL}/api/maintenance/room/${
          maintenanceForm.roomId
        }`
      );
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/maintenance/room/${
          maintenanceForm.roomId
        }`,
        {
          startDate: maintenanceForm.startDate,
          endDate: maintenanceForm.endDate,
        },
        { headers: { 'x-auth-token': token } }
      );
      console.log('MaintenanceAdmin: Room maintenance updated:', response.data);
      setShowMaintenanceModal(false);
      setMaintenanceForm({ roomId: '', startDate: '', endDate: '' });
      setError(null);
    } catch (err) {
      console.error('MaintenanceAdmin: Error updating maintenance:', err);
      console.error('MaintenanceAdmin: Error response:', err.response?.data);
      setError(
        err.response?.data?.msg ||
          'Failed to update maintenance. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openMaintenanceModal = (roomId) => {
    console.log('MaintenanceAdmin: Opening modal for roomId:', roomId);
    setMaintenanceForm((prev) => ({ ...prev, roomId }));
    setShowMaintenanceModal(true);
  };

  const closeMaintenanceModal = () => {
    setShowMaintenanceModal(false);
    setMaintenanceForm({ roomId: '', startDate: '', endDate: '' });
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-white">Access denied. Admins only.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue">
        Manage Maintenance Reports
      </h1>
      {error && (
        <div className="bg-red-900 text-white p-3 rounded mb-4">{error}</div>
      )}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-gray-800 bg-opacity-70 rounded-lg p-8 text-center text-white">
          <p className="text-xl">No maintenance reports found.</p>
        </div>
      ) : (
        <div className="bg-blue-900 bg-opacity-70 rounded-lg p-6">
          <table className="min-w-full bg-black bg-opacity-50 rounded-lg">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Room
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Reported By
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Description
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-500">
                  <td className="px-6 py-4">
                    {report.roomId?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
{report.userId?.name || report.userId?.email || 'Unknown'}                  </td>
                  <td className="px-6 py-4">{report.description}</td>
                  <td className="px-6 py-4">
                    <select
                      value={report.status}
                      onChange={(e) =>
                        handleStatusChange(report._id, e.target.value)
                      }
                      className="bg-gray-800 text-white border-gray-700 rounded-md px-3 py-1"
                      disabled={loading}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openMaintenanceModal(report.roomId._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                      disabled={loading}
                    >
                      Schedule Maintenance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-white">
              Schedule Room Maintenance
            </h3>
            <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={maintenanceForm.startDate}
                  onChange={handleMaintenanceFormChange}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={maintenanceForm.endDate}
                  onChange={handleMaintenanceFormChange}
                  className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeMaintenanceModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceAdmin;
