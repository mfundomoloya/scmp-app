import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MaintenanceReportForm = ({ onReportSubmitted }) => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    description: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  console.log(
    'MaintenanceReportForm: Rendering for user:',
    user?.id,
    'role:',
    user?.role
  );

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log(
          'MaintenanceReportForm: Fetching rooms with token:',
          token ? '[REDACTED]' : null
        );
        console.log(
          'MaintenanceReportForm: API URL:',
          import.meta.env.VITE_API_URL
        );
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/rooms`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log('MaintenanceReportForm: Fetched rooms:', response.data);
        if (response.data.length === 0) {
          setError('No rooms available. Contact support.');
        } else {
          setRooms(response.data);
        }
      } catch (err) {
        console.error('MaintenanceReportForm: Error fetching rooms:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setError(
          err.response?.data?.msg || 'Failed to load rooms. Please try again.'
        );
      }
    };
    if (user) {
      console.log(
        'MaintenanceReportForm: Triggering fetchRooms for user:',
        user.id
      );
      fetchRooms();
    } else {
      console.log('MaintenanceReportForm: No user, skipping fetchRooms');
      setError('Please log in to report maintenance issues.');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      console.log('MaintenanceReportForm: Submitting:', formData);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/maintenance`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('MaintenanceReportForm: Report created:', response.data);
      setSuccess('Maintenance issue reported successfully!');
      setFormData({ roomId: '', description: '' });
      if (onReportSubmitted) onReportSubmitted();
      navigate('/maintenance/report'); // Redirect to list
    } catch (err) {
      console.error('MaintenanceReportForm: Error creating report:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(
        err.response?.data?.msg || 'Failed to submit report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-white">
        Please log in to report maintenance issues.
      </div>
    );
  }

  return (
    <div className="bg-blue-600 bg-opacity-70 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-semibold text-blue mb-4">
        Report Maintenance Issue
      </h3>
      {error && (
        <div className="bg-red-900 text-white p-3 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-900 text-white p-3 rounded mb-4">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Room
          </label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading || rooms.length === 0}
          >
            <option value="">Choose a room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Issue Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue (e.g., broken projector, leaking pipe)"
            className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            required
            minLength={10}
            maxLength={500}
            disabled={loading}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={loading || rooms.length === 0}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceReportForm;
