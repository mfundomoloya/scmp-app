import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LecturerDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        {user ? `Welcome, ${user.name}` : 'Lecturer Dashboard'}
      </h2>
      <p className="text-gray-700">
        This is the lecturer dashboard. Here you can manage your schedule, book rooms, and more.
      </p>
    </div>
  );
};

export default LecturerDashboard;