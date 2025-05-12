import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/announcements`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAnnouncements(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch announcements');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchAnnouncements();
  }, [user]);

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-800 py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Campus Announcements</h1>
      {announcements.length === 0 ? (
        <div className="bg-gray-900 p-6 rounded-lg text-gray-400 text-center">No announcements available.</div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {announcements.map(a => (
            <div key={a._id} className="bg-gray-900 p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-semibold text-white">{a.title}</h3>
              <p className="text-gray-300 mt-2">{a.content}</p>
              <p className="text-gray-400 text-sm mt-2">
                Posted on {new Date(a.createdAt).toLocaleString('en-ZA')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;