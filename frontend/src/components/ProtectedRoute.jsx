import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Decode JWT for user data if AuthContext user is unavailable
  let decodedUser = user;
  if (token && !user) {
    try {
      decodedUser = jwtDecode(token);
      console.log('ProtectedRoute: Decoded JWT:', {
        id: decodedUser.id,
        role: decodedUser.role,
      });
    } catch (err) {
      console.error('ProtectedRoute: Invalid token:', err);
      localStorage.removeItem('token');
      toast.error('Session expired. Please log in again.');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  console.log(
    'ProtectedRoute: User:',
    decodedUser ? { id: decodedUser.id, role: decodedUser.role } : null
  );
  console.log('ProtectedRoute: Role(s) allowed:', role);

  // Convert role to array
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading</h2>
          <p className="text-gray-500">
            Please wait while we load your content...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!decodedUser) {
    console.log('ProtectedRoute: No user, redirecting to /login');
    toast.error('Please log in to access this page.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to /rooms if role not allowed
  if (allowedRoles && !allowedRoles.includes(decodedUser.role)) {
    console.log(
      `ProtectedRoute: Role ${decodedUser.role} not allowed, redirecting to /rooms`
    );
    toast.error(
      `Access denied. This page is restricted to ${allowedRoles.join(
        ' or '
      )} users.`
    );
    return <Navigate to="/rooms" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;
