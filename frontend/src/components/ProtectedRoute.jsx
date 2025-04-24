import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  console.log('ProtectedRoute: User:', user ? { id: user.id, role: user.role } : null);
  console.log('ProtectedRoute: Role(s) allowed:', role);

  if (loading) {
    console.log('ProtectedRoute: Loading...');
    return <div>Loading...</div>;
  }
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /login');
    return <Navigate to="/login" />;
  }
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(user.role)) {
      console.log(`ProtectedRoute: Role ${user.role} not allowed, redirecting to /`);
      return <Navigate to="/" />;
    }
  }

  console.log('ProtectedRoute: Access granted');
  return children;
};

export default ProtectedRoute;