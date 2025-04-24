import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element, roles }) => {
  const { user } = useContext(AuthContext);
  console.log('PrivateRoute: User:', user ? { id: user.id, role: user.role } : null);
  console.log('PrivateRoute: Roles allowed:', roles);
  return user && roles.includes(user.role) ? element : <Navigate to="/login" />;
};

export default PrivateRoute;