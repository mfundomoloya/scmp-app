import BookingList from '../components/BookingList';

const AdminPanel = () => {
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Manage all bookings and users.</p>
      <BookingList />
    </div>
  );
};

export default AdminPanel;