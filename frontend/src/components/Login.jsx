import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaEnvelope,
  FaLock,
} from 'react-icons/fa';

const Login = () => {
  // Define colors to match footer
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  //const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useContext(AuthContext);
  const [rememberMe, setRememberMe] = useState(false);

  // Dynamic current year
  const currentYear = new Date().getFullYear();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('Submitting login:', {
      email,
      passwordLength: password.length,
    });
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await login(normalizedEmail, password);
      console.log('Login successful:', { email: normalizedEmail });
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        err.response?.data?.msg ||
          'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
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
                Welcome Back
              </h2>
              <p style={{ color: '#4B5563' }}>
                Sign in to your Smart Campus account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                      style={{
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F9FAFB',
                        focusRing: mediumBlueColor,
                      }}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                    style={{ color: '#4B5563' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock
                        className="h-5 w-5"
                        style={{ color: mediumBlueColor }}
                      />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                      style={{
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F9FAFB',
                        focusRing: mediumBlueColor,
                      }}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none transition duration-200"
                      style={{ color: mediumBlueColor }}
                      onMouseOver={(e) => (e.target.style.color = blueColor)}
                      onMouseOut={(e) =>
                        (e.target.style.color = mediumBlueColor)
                      }
                    >
                      {showPassword ? (
                        <FaEye size={18} />
                      ) : (
                        <FaEyeSlash size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Add this after the password input and before the error message */}
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm"
                  style={{ color: '#4B5563' }}
                >
                  Remember me
                </label>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center border-l-4 border-red-500 animate-pulse">
                  <FaExclamationCircle className="mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="transition duration-300"
                  style={{ color: mediumBlueColor, transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                >
                  Forgot Password?
                </Link>
                <Link
                  to="/register"
                  className="transition duration-300"
                  style={{ color: mediumBlueColor, transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                >
                  Create Account
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#bfdbfe' : '#2563eb',
                  transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) =>
                  !loading && (e.target.style.backgroundColor = '#1d4ed8')
                }
                onMouseOut={(e) =>
                  !loading && (e.target.style.backgroundColor = '#2563eb')
                }
                className="w-full text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-70 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Logging in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

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

export default Login;
