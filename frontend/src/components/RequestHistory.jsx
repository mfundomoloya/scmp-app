import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const RequestHistory = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const endpoint = user.role === 'student' ? '/api/requests/student' : '/api/requests/lecturer/history';

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('RequestHistory: Response:', response.data);
        setRequests(response.data);
      } catch (err) {
        console.error('RequestHistory: Fetch error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.message || 'Failed to load request history');
        toast.error(err.response?.data?.message || 'Failed to load request history');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && (user.role === 'student' || user.role === 'lecturer')) {
      fetchRequests();
    }
  }, [user]);

  return (
    <div className="min-h-screen relative pt-20">
      <div
        className="fixed inset-0 top-20 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url(/src/assets/lecture-hall.jpg)',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Request History</h1>
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          {!isLoading && !error && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gray-50 rounded-lg p-4 border-l-4 hover:shadow-md transition-shadow duration-200"
                      style={{ borderLeftColor: '#3b82f6' }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-black">
                            {request.type}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            Course: {request.course}
                          </p>
                          <p className="text-gray-600">
                            {user.role === 'student' ? 'Lecturer' : 'Student'}: {user.role === 'student' ? request.lecturer : request.student}
                          </p>
                          <p className="text-gray-600">
                            Date: {new Date(request.date).toLocaleDateString('en-ZA')}
                          </p>
                        </div>
                        <span
                          className={`inline-block text-sm px-3 py-1 rounded-full ${
                            request.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No requests found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestHistory;