import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';

const ForgotPassword = () => {
  // Define colors to match the login component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  //const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dynamic current year
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      console.log('Requesting password reset:', { email });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        { email }
      );
      console.log('Forgot password response:', response.data);
      setMessage(response.data.msg);
    } catch (err) {
      console.error('Forgot password error:', {
        message: err.message,
        response: err.response?.data,
      });
      setError(
        err.response?.data?.msg ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-md">
        <div
          className="backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border"
          style={{
            borderColor: lightBlueColor,
            backgroundColor: 'white',
          }}
        >
          <div className="p-8">
            <div className="mb-8 text-center">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: blueColor }}
              >
                Forgot Password
              </h2>
              <p style={{ color: '#4B5563' }}>
                Enter your email to receive a password reset link
              </p>
            </div>

            {message && (
              <div className="mb-6 rounded-md bg-green-50 p-4 border-l-4 border-green-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5"
                      style={{ color: '#10B981' }} // text-green-500
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#065F46' }}
                    >
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4 border-l-4 border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5"
                      style={{ color: '#EF4444' }} // text-red-500
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p
                      className="text-sm font-medium"
                      style={{ color: '#B91C1C' }}
                    >
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#4B5563' }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope
                      className="h-5 w-5"
                      style={{ color: mediumBlueColor }}
                    />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                    style={{
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937',
                    }}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{
                    backgroundColor: loading ? '#bfdbfe' : mediumBlueColor,
                    transition: 'background-color 0.3s',
                  }}
                  onMouseOver={(e) =>
                    !loading && (e.target.style.backgroundColor = blueColor)
                  }
                  onMouseOut={(e) =>
                    !loading &&
                    (e.target.style.backgroundColor = mediumBlueColor)
                  }
                  className="w-full text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-70 shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: lightBlueColor }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white" style={{ color: '#6B7280' }}>
                    Or
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  to="/login"
                  className="font-medium transition duration-300"
                  style={{ color: mediumBlueColor, transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                >
                  Return to Login
                </Link>
              </div>
            </div>

            <div
              className="mt-8 pt-6 text-center text-sm"
              style={{
                borderTop: `1px solid ${lightBlueColor}`,
                color: '#6B7280', // text-gray-500 equivalent
              }}
            >
              <p>Smart Campus Services Portal</p>
              <p>© {currentYear} All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
