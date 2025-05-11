import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(AuthContext);

  console.log('ProtectedRoute: Checking access', { user, loading, allowedRoles });

  if (loading) {
    console.log('ProtectedRoute: Loading, rendering loading state');
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute: Role not allowed', { role: user.role, allowedRoles });
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Access granted', { userId: user.id, role: user.role });
  return children ? children : <Outlet />;
};

export default ProtectedRoute;