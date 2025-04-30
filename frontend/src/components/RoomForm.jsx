import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const RoomForm = ({ onRoomCreated }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    maintenance: [{ startDate: '', endDate: '' }],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'admin') {
    return <p className="text-red-500">Unauthorized: Admins only</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMaintenanceChange = (index, field, value) => {
    const updatedMaintenance = [...formData.maintenance];
    updatedMaintenance[index] = { ...updatedMaintenance[index], [field]: value };
    setFormData((prev) => ({ ...prev, maintenance: updatedMaintenance }));
  };

  const addMaintenancePeriod = () => {
    setFormData((prev) => ({
      ...prev,
      maintenance: [...prev.maintenance, { startDate: '', endDate: '' }],
    }));
  };

  const removeMaintenancePeriod = (index) => {
    setFormData((prev) => ({
      ...prev,
      maintenance: prev.maintenance.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.capacity) {
      setError('Name and capacity are required');
      return;
    }
    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity < 1) {
      setError('Capacity must be a positive number');
      return;
    }
    const maintenance = formData.maintenance.filter(
      (m) => m.startDate && m.endDate && new Date(m.startDate) <= new Date(m.endDate)
    );
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/rooms`,
        { name: formData.name, capacity, maintenance },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      console.log('RoomForm: Room created:', response.data);
      setFormData({ name: '', capacity: '', maintenance: [{ startDate: '', endDate: '' }] });
      setError('');
      onRoomCreated();
    } catch (err) {
      console.error('RoomForm: Error creating room:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New Room</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Room Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
            required
          />
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="mt-1 w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Maintenance Periods</label>
          {formData.maintenance.map((period, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <input
                type="date"
                value={period.startDate}
                onChange={(e) => handleMaintenanceChange(index, 'startDate', e.target.value)}
                className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
              />
              <input
                type="date"
                value={period.endDate}
                onChange={(e) => handleMaintenanceChange(index, 'endDate', e.target.value)}
                className="w-full rounded-md bg-gray-800 border-gray-700 text-white py-2 px-3"
              />
              {formData.maintenance.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMaintenancePeriod(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMaintenancePeriod}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Maintenance Period
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
};

export default RoomForm;