import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';

const LecturerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <div>
      <h2>
        {user ? `Welcome, ${user.name}` : 'Lecturer Dashboard'}
      </h2>
      <p>This is the lecturer dashboard. Here you can manage your schedule, book rooms, and more.</p>
      <BookingForm onBookingCreated={handleBookingCreated} />
      <BookingList refresh={refreshKey} />
    </div>
  );
};

export default LecturerDashboard;