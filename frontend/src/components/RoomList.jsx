import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const RoomList = () => {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('RoomList: Fetching rooms with token:', token ? '[REDACTED]' : null);
      console.log('RoomList: API URL:', import.meta.env.VITE_API_URL);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('RoomList: Rooms fetched:', response.data);
      setRooms(response.data);
      setError('');
    } catch (err) {
      console.error('RoomList: Error fetching rooms:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('RoomList: Fetching rooms for user:', user.id, 'role:', user.role);
      fetchRooms();
    } else {
      console.log('RoomList: No user, skipping fetchRooms');
      setError('Please login to view rooms');
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('RoomList: Deleting room:', id);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('RoomList: Room deleted:', id);
      fetchRooms();
    } catch (err) {
      console.error('RoomList: Error deleting room:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Room List</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-gray-500 mb-4">Loading rooms...</p>}
      {!loading && rooms.length === 0 ? (
        <p>No rooms found. {isAdmin ? 'Add a new room to get started.' : ''}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Capacity</th>
                <th className="px-4 py-2 text-left">Maintenance Periods</th>
                {isAdmin && <th className="px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-700">
                  <td className="px-4 py-2">{room.name}</td>
                  <td className="px-4 py-2">{room.capacity}</td>
                  <td className="px-4 py-2">
                    {room.maintenance.length === 0 ? (
                      'None'
                    ) : (
                      <ul className="list-disc pl-4">
                        {room.maintenance.map((m, i) => (
                          <li key={i}>
                            {new Date(m.startDate).toLocaleDateString()} -{' '}
                            {new Date(m.endDate).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded disabled:opacity-50"
                        onClick={() => handleDelete(room._id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomList;