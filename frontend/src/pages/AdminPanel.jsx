import BookingList from '../components/BookingList';

const AdminPanel = () => {
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Manage all bookings and users.</p>
      <h2>Bookings</h2>
      <BookingList />
    </div>
  );
};

export default AdminPanel;