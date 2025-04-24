import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, markAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Debug logging
  console.log('Header: User:', user ? { id: user.id, role: user.role, name: user.name } : null);
  console.log('Header: Notifications:', notifications);
  console.log('Header: Show Notifications:', showNotifications);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle dropdown
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleBookingsClick = () => {
    console.log('Bookings link clicked, navigating to', user.role === 'admin' ? '/admin/bookings' : '/bookings');
    navigate(user.role === 'admin' ? '/admin/bookings' : '/bookings');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="no-underline">
          <h1 className="text-2xl font-bold">Smart Campus Portal</h1>
        </Link>
        <nav>
          <ul className="list-none flex items-center space-x-4">
            {user ? (
            <>
            <li>
              Welcome, <span>{user.name || 'User'}</span>
            </li>
            {user.role !== 'admin' && (
              <>
                <li>
                  <Link
                    to="/bookings"
                    onClick={handleBookingsClick}
                    className="text-white no-underline hover:underline hover:text-blue-300"
                  >
                    Bookings
                  </Link>
                </li>
                <li ref={dropdownRef}>
                  <div className="relative">
                    <button
                      onClick={toggleNotifications}
                      className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-white flex items-center"
                    >
                      Notifications
                      {notifications && notifications.filter((n) => !n.read).length > 0 && (
                        <span className="ml-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                          {notifications.filter((n) => !n.read).length}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
                        {notifications && notifications.length === 0 ? (
                          <p className="text-gray-600">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-2 border-b last:border-b-0 ${n.read ? 'opacity-50' : ''}`}
                            >
                              <p className="text-sm">
                                {n.message}{' '}
                                <span className="text-xs text-gray-500">
                                  ({n.createdAt ? new Date(n.createdAt).toLocaleString() : 'No date'})
                                </span>
                              </p>
                              {!n.read && (
                                <button
                                  onClick={() => markAsRead(n._id)}
                                  className="mt-1 text-blue-500 hover:text-blue-600 text-xs"
                                >
                                  Mark as Read
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </li>
              </>
            )}
            <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white no-underline"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-white no-underline hover:underline hover:text-blue-300">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-white no-underline hover:underline hover:text-blue-300">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;