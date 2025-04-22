import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
                  <li>
                    <div className="relative">
                      <BellIcon className="h-6 w-6 text-white" />
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                          {notifications.filter((n) => !n.read).length}
                        </span>
                      )}
                    </div>
                  </li>
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