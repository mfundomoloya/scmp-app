import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookingList from '../components/BookingList';

const AdminBookings = () => {
  const { user } = useContext(AuthContext);

  console.log('AdminBookings: User:', user ? { id: user.id, role: user.role, name: user.name } : null);

  if (!user || user.role !== 'admin') {
    console.log('AdminBookings: Access denied, user:', user ? user.role : null);
    return <div className="p-4">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-blue-600">Manage Bookings</h1>
        <p className="mt-2 text-lg text-gray-600">View and manage all bookings here.</p>
      </div>

      {/* Booking List Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">All Bookings</h2>
        <BookingList />
      </div>
    </div>
  );
};

export default AdminBookings;