import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState(null);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setError('No verification token provided. Please use the link from your email.');
      setMessage('');
      return;
    }

    if (hasVerifiedRef.current) return;

    const verifyEmail = async () => {
      hasVerifiedRef.current = true;
      try {
        console.log('Verifying token:', { token, length: token?.length, url: window.location.href });
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`);
        console.log('Verification response:', response.data);
        setMessage(response.data.msg);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Verification error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
        });
        setError(err.response?.data?.msg || 'Verification failed. Please try again or request a new link.');
        setMessage('');
      }
    };

    verifyEmail();

    // No cleanup needed since hasVerifiedRef prevents re-runs
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyEmail;