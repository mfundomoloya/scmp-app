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
  console.log(
    'Header: User:',
    user ? { id: user.id, role: user.role, name: user.name } : null
  );
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
    console.log(
      'Bookings link clicked, navigating to',
      user.role === 'admin' ? '/admin/bookings' : '/bookings'
    );
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
    <header className="bg-black text-white py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <Link to="/" className="no-underline flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
          </svg>
          <h1 className="text-2xl font-bold tracking-wider">SMART CAMPUS</h1>
        </Link>

        {/* Main Navigation and User Status */}
        <div className="flex items-center space-x-6">
          {/* Main Navigation Links - Always visible */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-8">
              <li>
                <Link
                  to="/about"
                  className="text-white no-underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  ABOUT
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white no-underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  CONTACT
                </Link>
              </li>
              <li>
                <Link
                  to="/timetable"
                  className="text-white no-underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  TIMETABLE
                </Link>
              </li>
              <li>
                <Link
                  to={user?.role === 'admin' ? '/admin/bookings' : '/bookings'}
                  onClick={handleBookingsClick}
                  className="text-white no-underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  BOOKINGS
                </Link>
              </li>
              <li>
                <Link
                  to="/maintenance"
                  className="text-white no-underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  MAINTENANCE
                </Link>
              </li>
            </ul>
          </nav>

          {/* User Status Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm hidden md:inline-block">
                  Welcome, {user.name || 'User'}
                </span>

                {/* Notifications Button */}
                {user.role !== 'admin' && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleNotifications}
                      className="text-white px-3 py-1 rounded flex items-center uppercase font-semibold text-sm"
                      aria-label="Notifications"
                    >
                      <span className="hidden md:inline-block tracking-wide">
                        NOTIFICATIONS
                      </span>
                      <span className="md:hidden">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </span>
                      {notifications &&
                        notifications.filter((n) => !n.read).length > 0 && (
                          <span className="ml-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                            {notifications.filter((n) => !n.read).length}
                          </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
                        {notifications && notifications.length === 0 ? (
                          <p className="text-gray-600">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-2 border-b last:border-b-0 ${
                                n.read ? 'opacity-50' : ''
                              }`}
                            >
                              <p className="text-sm">
                                {n.message}{' '}
                                <span className="text-xs text-gray-500">
                                  (
                                  {n.createdAt
                                    ? new Date(n.createdAt).toLocaleString()
                                    : 'No date'}
                                  )
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
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white no-underline font-semibold tracking-wide text-sm uppercase"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white no-underline hover:underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="text-white no-underline hover:underline hover:text-blue-300 font-semibold text-sm tracking-wide uppercase"
                >
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
