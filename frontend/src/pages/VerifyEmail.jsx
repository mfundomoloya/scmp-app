import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`);
        setMessage(res.data.msg);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setMessage(err.response?.data?.msg || 'Verification failed');
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">{message}</h2>
      </div>
    </div>
  );
};

export default VerifyEmail;