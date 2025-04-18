import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        {user ? `Welcome, ${user.name}` : 'Admin Panel'}
      </h2>
      <p className="text-gray-700">
        This is the admin panel. Here you can manage users, rooms, and system settings.
      </p>
    </div>
  );
};

export default AdminPanel;