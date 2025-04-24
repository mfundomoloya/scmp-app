import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LecturerDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-blue-600">
          {user ? `Welcome, ${user.name}` : 'Lecturer Dashboard'}
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          Manage your schedule in the{' '}
          <Link to="/bookings" className="text-blue-500 hover:underline">
            Bookings
          </Link>{' '}
          section.
        </p>
      </div>
    </div>
  );
};

export default LecturerDashboard;