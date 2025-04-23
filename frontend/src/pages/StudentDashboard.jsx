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
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Dashboard Header */}
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-blue-600">
          {user ? `Welcome, ${user.name}` : 'Student Dashboard'}
        </h2>
        <p className="mt-2 text-lg text-gray-600">Manage your schedule and bookings here.</p>
      </div>

      {/* Booking Form Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Create a Booking</h3>
        <BookingForm onBookingCreated={handleBookingCreated} />
      </div>

      {/* Booking List Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Bookings</h3>
        <BookingList refresh={refreshKey} />
      </div>
    </div>
  );
};

export default StudentDashboard;
