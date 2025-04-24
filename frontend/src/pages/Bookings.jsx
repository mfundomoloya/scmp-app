import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  console.log('Bookings: User:', user ? { id: user.id, role: user.role, name: user.name } : null);

  const handleBookingCreated = () => {
    console.log('Bookings: Booking created, refreshing list');
    setRefreshKey((prev) => prev + 1);
  };

  if (!user || user.role === 'admin') {
    console.log('Bookings: Access denied, user:', user ? user.role : null);
    return <div className="p-4">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-blue-600">
          {user ? `${user.name}'s Bookings` : 'Bookings'}
        </h1>
        <p className="mt-2 text-lg text-gray-600">Create and manage your bookings here.</p>
      </div>

      {/* Booking Form Section */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Create a Booking</h2>
        <BookingForm onBookingCreated={handleBookingCreated} />
      </div>

      {/* Booking List Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Bookings</h2>
        <BookingList refresh={refreshKey} />
      </div>
    </div>
  );
};

export default Bookings;