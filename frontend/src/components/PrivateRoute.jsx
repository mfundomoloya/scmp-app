import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element, roles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log(
    'PrivateRoute: User:',
    user ? { id: user.id, role: user.role } : null
  );
  console.log('PrivateRoute: Roles allowed:', roles);

  // If still loading, show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Authenticating
          </h2>
          <p className="text-gray-500">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have required role, show access denied page
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen relative">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url(/images/access-denied-bg.jpg)' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-75"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10 min-h-screen flex items-center justify-center">
          <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h2>

            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. This area is
              restricted to {roles.join(' or ')} users.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
              >
                Go Back
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-150"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in and has required role, render the element
  return element;
};

export default PrivateRoute;
