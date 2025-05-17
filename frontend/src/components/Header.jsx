import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const Header = () => {
  // Define colors explicitly, matching the footer approach
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent
  const brightBlueColor = '#3b82f6'; // blue-500 equivalent
  const blackColor = '#000000';
  const whiteColor = '#ffffff';
  const yellowColor = '#ffde21';

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

  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
    const handleClickOutside = (event) => {
      if (isNavigating) return;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <header
        style={{ backgroundColor: whiteColor, color: blackColor }}
        className="py-5 shadow-md"
      >
        <div className="container mx-auto px-8">
          <p>Loading...</p>
        </div>
      </header>
    );
  }

  const getLinkStyle = (path) => {
    const baseStyle = {
      color: blueColor,
      textDecoration: 'none',
      transition: 'color 0.15s',
      fontWeight: '500',
    };

    if (isActive(path)) {
      return {
        ...baseStyle,
        color: brightBlueColor,
      };
    }

    return baseStyle;
  };

  return (
    <header style={{ backgroundColor: whiteColor }} className="py-5 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-8">
        <Link to="/" className="no-underline flex items-center">
          <div
            style={{ backgroundColor: brightBlueColor }}
            className="p-2.5 mr-3 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold mr-12"
            style={{
              background: `linear-gradient(90deg, ${blueColor} 0%, ${brightBlueColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'bold',
            }}
          >
            Smart Campus
          </h1>
        </Link>
        <nav className="flex-1 flex justify-end">
          <ul className="list-none flex items-center space-x-8">
            {user ? (
              <>
                <li>
                  <Link
                    to="/about"
                    style={getLinkStyle('/about')}
                    onClick={() => setIsNavigating(true)}
                    onMouseOver={(e) =>
                      !isActive('/about') &&
                      (e.target.style.color = brightBlueColor)
                    }
                    onMouseOut={(e) =>
                      !isActive('/about') && (e.target.style.color = blueColor)
                    }
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    style={getLinkStyle('/contact')}
                    onClick={() => setIsNavigating(true)}
                    onMouseOver={(e) =>
                      !isActive('/contact') &&
                      (e.target.style.color = brightBlueColor)
                    }
                    onMouseOut={(e) =>
                      !isActive('/contact') &&
                      (e.target.style.color = blueColor)
                    }
                  >
                    Contact
                  </Link>
                </li>
                {(user.role === 'student' || user.role === 'lecturer') && (
                  <>
                    <li>
                      <Link
                        to="/timetable"
                        style={getLinkStyle('/timetable')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/timetable') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/timetable') &&
                          (e.target.style.color = blueColor)
                        }
                      >
                        Timetable
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/bookings"
                        style={getLinkStyle('/bookings')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/bookings') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/bookings') &&
                          (e.target.style.color = blueColor)
                        }
                      >
                        Bookings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/requests"
                        style={getLinkStyle('/requests')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/requests') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/requests') &&
                          (e.target.style.color = blueColor)
                        }
                      >
                        Requests
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/announcements"
                        style={getLinkStyle('/announcements')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/announcements') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/announcements') &&
                          (e.target.style.color =
                            !isActive('/about') &&
                            (e.target.style.color = blueColor))
                        }
                      >
                        Announcements
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/maintenance/report"
                        style={getLinkStyle('/maintenance/report')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/maintenance/report') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/maintenance/report') &&
                          (e.target.style.color =
                            !isActive('/about') &&
                            (e.target.style.color = blueColor))
                        }
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
                        style={getLinkStyle('/admin/bookings')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/admin/bookings') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/admin/bookings') &&
                          (e.target.style.color =
                            !isActive('/about') &&
                            (e.target.style.color = blueColor))
                        }
                      >
                        Bookings
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/rooms/import"
                        style={getLinkStyle('/admin/rooms/import')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/admin/rooms/import') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/admin/rooms/import') &&
                          (e.target.style.color = brightBlueColor)
                        }
                      >
                        Import Rooms
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/maintenance"
                        style={getLinkStyle('/admin/maintenance')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/admin/maintenance') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/admin/maintenance') &&
                          (e.target.style.color = brightBlueColor)
                        }
                      >
                        Maintenance
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/timetables/import"
                        style={getLinkStyle('/admin/timetables/import')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/admin/timetables/import') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/admin/timetables/import') &&
                          (e.target.style.color = brightBlueColor)
                        }
                      >
                        Import Timetables
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/timetables"
                        style={getLinkStyle('/admin/timetables')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/admin/timetables') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/admin/timetables') &&
                          (e.target.style.color = brightBlueColor)
                        }
                      >
                        Manage Timetables
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/announcements"
                        style={getLinkStyle('/admin/announcements')}
                        onClick={() => setIsNavigating(true)}
                        onMouseOver={(e) =>
                          !isActive('/admin/announcements') &&
                          (e.target.style.color = brightBlueColor)
                        }
                        onMouseOut={(e) =>
                          !isActive('/admin/announcements') &&
                          (e.target.style.color = brightBlueColor)
                        }
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
                      className="px-3 py-1 flex items-center"
                      style={{
                        color: blueColor,
                        transition: 'color 0.15s',
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.color = brightBlueColor)
                      }
                      onMouseOut={(e) =>
                        (e.target.style.color =
                          !isActive('/about') &&
                          (e.target.style.color = blueColor))
                      }
                    >
                      Notifications
                      {notifications &&
                        notifications.filter((n) => !n.read).length > 0 && (
                          <span
                            className="ml-2 rounded-full h-5 w-5 flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: yellowColor,
                              color: whiteColor,
                            }}
                            onClick={() => setIsNavigating(true)}
                          >
                            {notifications.filter((n) => !n.read).length}
                          </span>
                        )}
                    </button>
                    {showNotifications && (
                      <div
                        className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto"
                        style={{
                          backgroundColor: whiteColor,
                          color: blackColor,
                        }}
                        //onClick={() => setIsNavigating(true)}
                      >
                        {notifications && notifications.length === 0 ? (
                          <p style={{ color: '#4b5563' }}>No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-2 border-b last:border-b-0`}
                              style={{ opacity: n.read ? 0.5 : 1 }}
                            >
                              <p className="text-sm">
                                {n.message}{' '}
                                <span
                                  style={{ color: '#6b7280' }}
                                  className="text-xs"
                                >
                                  (
                                  {n.createdAt
                                    ? new Date(n.createdAt).toLocaleString()
                                    : 'No date'}
                                  )
                                </span>
                              </p>
                              {!n.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(n._id);
                                  }}
                                  className="mt-1 text-xs"
                                  style={{
                                    color: brightBlueColor,
                                    transition: 'color 0.15s',
                                  }}
                                  onMouseOver={(e) =>
                                    (e.target.style.color = mediumBlueColor)
                                  }
                                  onMouseOut={(e) =>
                                    (e.target.style.color = brightBlueColor)
                                  }
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
                      className="px-3 py-1 flex items-center"
                      style={{
                        color: whiteColor,
                        transition: 'color 0.15s',
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.color = brightBlueColor)
                      }
                      onMouseOut={(e) => (e.target.style.color = whiteColor)}
                    >
                      {user && (
                        <>
                          <img
                            src={
                              user.avatar && user.avatar.startsWith('http')
                                ? user.avatar
                                : user.avatar
                                ? `${import.meta.env.VITE_API_URL}/${
                                    user.avatar
                                  }`
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
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50"
                        style={{
                          backgroundColor: whiteColor,
                          color: blackColor,
                        }}
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-black"
                          style={{
                            transition: 'background-color 0.15s',
                            backgroundColor: brightBlueColor,
                          }}
                          onClick={() => setIsNavigating(true)}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor =
                              veryLightBlueColor)
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = brightBlueColor)
                          }
                          // onClick={() => setShowProfileDropdown(false)}
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left  text-black px-4 py-2"
                          style={{
                            transition: 'background-color 0.15s',
                            backgroundColor: 'brightBlueColor',
                          }}
                          //onClick={() => setIsNavigating(true)}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = mediumBlueColor)
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = brightBlueColor)
                          }
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
                    style={getLinkStyle('/about')}
                    onMouseOver={(e) =>
                      !isActive('/about') &&
                      (e.target.style.color = mediumBlueColor)
                    }
                    onMouseOut={(e) =>
                      !isActive('/about') && (e.target.style.color = blueColor)
                    }
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    style={getLinkStyle('/contact')}
                    onMouseOver={(e) =>
                      !isActive('/contact') &&
                      (e.target.style.color = mediumBlueColor)
                    } // Darker blue on hover
                    onMouseOut={(e) =>
                      !isActive('/contact') &&
                      (e.target.style.color = blueColor)
                    } // Back to blue
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="px-4 py-1.5 rounded"
                    style={{
                      backgroundColor: isActive('/register')
                        ? brightBlueColor
                        : brightBlueColor,
                      color: whiteColor,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = mediumBlueColor)
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = brightBlueColor)
                    }
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded"
                    style={{
                      backgroundColor: isActive('/register')
                        ? brightBlueColor
                        : brightBlueColor,
                      color: whiteColor,
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = mediumBlueColor)
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = brightBlueColor)
                    }
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
