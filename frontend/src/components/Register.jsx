import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const Register = () => {
  // Define colors to match the login component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  //const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Dynamic current year
  const currentYear = new Date().getFullYear();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    // Client-side validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }
    if (firstName.length > 50 || lastName.length > 50) {
      setError('First and last names must be 50 characters or less');
      setLoading(false);
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(firstName) || !/^[a-zA-Z\s]+$/.test(lastName)) {
      setError('Names must contain only letters and spaces');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Registering user:', { firstName, lastName, email, role });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        { firstName, lastName, email, password, role }
      );
      console.log('Registration response:', response.data);

      setMessage(response.data.msg);
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      console.error('Registration error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      setError(
        err.response?.data?.msg || 'Registration failed. Please try again.'
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
          'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-lg">
        <div
          className="backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border"
          style={{
            borderColor: lightBlueColor,
            backgroundColor: 'white',
          }}
        >
          <div className="p-8">
            <div className="text-center mb-6">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: blueColor }}
              >
                Create Account
              </h2>
              <p style={{ color: '#4B5563' }}>Join the Smart Campus Portal</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: blueColor }}
                >
                  Personal Information
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-1"
                      style={{ color: '#4B5563' }}
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser
                          className="h-5 w-5"
                          style={{ color: mediumBlueColor }}
                        />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                        style={{
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F9FAFB',
                          color: '#1F2937',
                        }}
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-1"
                      style={{ color: '#4B5563' }}
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser
                          className="h-5 w-5"
                          style={{ color: mediumBlueColor }}
                        />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                        style={{
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F9FAFB',
                          color: '#1F2937',
                        }}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                    required
                    className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                    style={{
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    placeholder="Email address"
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
                    required
                    className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                    style={{
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none transition duration-200"
                    style={{ color: mediumBlueColor }}
                    onMouseOver={(e) => (e.target.style.color = blueColor)}
                    onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#4B5563' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock
                      className="h-5 w-5"
                      style={{ color: mediumBlueColor }}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                    style={{
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937',
                    }}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none transition duration-200"
                    style={{ color: mediumBlueColor }}
                    onMouseOver={(e) => (e.target.style.color = blueColor)}
                    onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#4B5563' }}
                >
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
                  style={{
                    borderColor: '#D1D5DB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                  }}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
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
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p style={{ color: '#6B7280' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium transition duration-300"
                  style={{ color: mediumBlueColor, transition: 'color 0.3s' }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                >
                  Login
                </Link>
              </p>
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

export default Register;
