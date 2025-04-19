import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const LecturerDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2>
        {user ? `Welcome, ${user.name}` : 'Lecturer Dashboard'}
      </h2>
      <p>
        This is the lecturer dashboard. Here you can manage your schedule, book rooms, and more.
      </p>
    </div>
  );
};

export default LecturerDashboard;