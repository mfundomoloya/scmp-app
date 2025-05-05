import React from 'react';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleBookingsClick = () => {
    navigate(user.role === 'admin' ? '/admin/bookings' : '/bookings');
  };

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
    <header className="bg-purple text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white no-underline">
          <h1 className="text-2xl font-bold">Smart Campus Portal</h1>
        </Link>
        <nav>
          <ul className="flex items-center space-x-4">
            {user ? (
              <>
                <li className="text-white">
                  Welcome,{' '}
                  <span className="font-medium">{user.name || 'User'}</span>
                </li>
                {user.role !== 'admin' && (
                  <>
                    <li>
                      <Link
                        to="/bookings"
                        onClick={handleBookingsClick}
                        className="text-white hover:text-silver transition duration-200"
                      >
                        Bookings
                      </Link>
                    </li>
                    <li ref={dropdownRef} className="relative">
                      <button
                        onClick={toggleNotifications}
                        className="bg-midnight hover:bg-blue-800 px-3 py-1 rounded text-white flex items-center transition duration-200"
                      >
                        Notifications
                        {notifications &&
                          notifications.filter((n) => !n.read).length > 0 && (
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
                                    className="mt-1 text-purple hover:text-midnight text-xs"
                                  >
                                    Mark as Read
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </li>
                  </>
                )}
                <li>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white transition duration-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-white hover:text-silver transition duration-200"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-white hover:text-silver transition duration-200"
                  >
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
