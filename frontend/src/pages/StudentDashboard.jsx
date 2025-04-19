import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };
    return (
      <div >
      <h2>
        {user ? `Welcome, ${user.name}` : 'Lecturer Dashboard'}
      </h2>
        <p>Welcome, Student! Manage your schedule and bookings here.</p>
        <BookingForm onBookingCreated={handleBookingCreated} />
       <BookingList refresh={refreshKey} />
      </div>
    );
  };
  
  export default StudentDashboard;