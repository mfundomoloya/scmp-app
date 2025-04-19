import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2>
        {user ? `Welcome, ${user.name}` : 'Admin Panel'}
      </h2>
      <p>
        This is the admin panel. Here you can manage users, rooms, and system settings.
      </p>
    </div>
  );
};

export default AdminPanel;