import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Header = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const { notifications, markAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  console.log(
    'Header: User:',
    user ? { id: user.id, role: user.role, name: user.name } : null
  );
  console.log('Header: Notifications:', notifications);
  console.log('Header: Show Notifications:', showNotifications);
  console.log('Header: Show Profile Dropdown:', showProfileDropdown);
  console.log('Header: Loading:', loading);

  const handleLogout = () => {
    console.log('Header: Logging out');
    logout();
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
    setShowNotifications(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <header className="bg-black text-white py-5 shadow-md">
        <div className="container mx-auto px-8">
          <p>Loading...</p>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black text-white py-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-8">
        <Link to="/" className="no-underline flex items-center">
          <div className="bg-[#3b82f6] p-2.5 mr-3 rounded">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Smart Campus</h1>
        </Link>
        <nav className="flex-1 flex justify-end">
          <ul className="list-none flex items-center space-x-8">
            {user ? (
              <>
                <li>
                  <Link
                    to="/about"
                    className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/about') ? 'text-[#3b82f6]' : ''}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/contact') ? 'text-[#3b82f6]' : ''}`}
                  >
                    Contact
                  </Link>
                </li>
                {(user.role === 'student' || user.role === 'lecturer') && (
                  <>
                    <li>
                      <Link
                        to="/timetable"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/timetable') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Timetable
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/bookings"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/bookings') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Bookings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/announcements"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/announcements') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Announcements
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/maintenance/report"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/maintenance/report') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Maintenance
                      </Link>
                    </li>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <li>
                      <Link
                        to="/admin/bookings"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/bookings') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Bookings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/rooms"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/rooms') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Manage Rooms
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/rooms/import"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/rooms/import') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Import Rooms
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/maintenance"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/maintenance') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Maintenance
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/timetables/import"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/timetables/import') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Import Timetables
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/timetables"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/timetables') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Manage Timetables
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/announcements"
                        className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/admin/announcements') ? 'text-[#3b82f6]' : ''}`}
                      >
                        Announcements
                      </Link>
                    </li>
                  </>
                )}
                <li ref={notificationRef}>
                  <div className="relative">
                    <button
                      onClick={toggleNotifications}
                      className="hover:text-[#3b82f6] px-3 py-1 text-white flex items-center transition duration-150"
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
                                  className="mt-1 text-[#3b82f6] hover:text-blue-600 text-xs"
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
                <li ref={profileRef}>
                  <div className="relative">
                    <button
                      onClick={toggleProfileDropdown}
                      className="hover:text-[#3b82f6] px-3 py-1 text-white flex items-center transition duration-150"
                    >
                      {user && (
                        <>
                          <img
                            src={
                              user.avatar && user.avatar.startsWith('http')
                                ? user.avatar
                                : user.avatar
                                  ? `${import.meta.env.VITE_API_URL}/${user.avatar}`
                                  : 'https://placehold.co/100x100'
                            }
                            alt="Profile avatar"
                            className="w-6 h-6 rounded-full mr-2 object-cover"
                          />
                          {user.initials || user.name.charAt(0)}
                        </>
                      )}
                    </button>
                    {showProfileDropdown && user && (
                      <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg py-2 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 hover:bg-gray-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/about"
                    className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/about') ? 'text-[#3b82f6]' : ''}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className={`text-white no-underline hover:text-[#3b82f6] transition duration-150 font-medium ${isActive('/contact') ? 'text-[#3b82f6]' : ''}`}
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className={`text-white px-4 py-1.5 transition duration-150 ${
                      isActive('/login')
                        ? 'bg-white text-black'
                        : 'border border-white hover:bg-white hover:text-[#121824]'
                    } rounded`}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className={`px-4 py-1.5 rounded transition duration-150 ${
                      isActive('/register')
                        ? 'bg-[#3b82f6] text-white'
                        : 'bg-[#3b82f6] text-white hover:bg-blue-700'
                    }`}
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