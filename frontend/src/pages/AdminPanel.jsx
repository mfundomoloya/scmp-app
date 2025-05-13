import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);

  console.log('AdminPanel: User:', user ? { id: user.id, role: user.role, name: user.name } : null);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-blue-600">
          {user ? `Welcome, ${user.name}` : 'Admin Panel'}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage bookings in the{' '}
          <Link to="/admin/bookings" className="text-blue-500 hover:underline">
            Bookings
          </Link>{' '}
          section.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;