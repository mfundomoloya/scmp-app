import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';


const Bookings = () => {
  const { user } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  console.log('Bookings: User:', user ? { id: user.id, role: user.role, name: user.name } : null);

  console.log('Bookings: Component mounted');
  console.log('Bookings: User:', JSON.stringify(user, null, 2));
  console.log('Bookings: Rendering BookingList:', !!BookingList);
  console.log('Bookings: Rendering BookingForm:', !!BookingForm);

  if (!user) {
    console.log('Bookings: No user, redirecting to login');
    return <div>Please log in to view bookings.</div>;
  }

  const handleBookingCreated = () => {
    console.log('Bookings: Booking created, refreshing list');
    setRefreshKey((prev) => prev + 1);
    setShowForm(false);
  };

  if (!user || (user.role !== 'student' && user.role !== 'lecturer')) {
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
      <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 mb-4"
              >
                {showForm ? 'Hide Booking Form' : 'Create Booking'}
              </button>
              {showForm && (
                <div className="bg-gray-900 bg-opacity-70 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-300 mb-4">Create a Booking</h2>
                  <BookingForm onBookingCreated={handleBookingCreated} />
                </div>
              )}
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