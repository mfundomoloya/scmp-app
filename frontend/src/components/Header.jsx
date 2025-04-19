import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <div>
        <Link to="/" className=" no-underline">
          <h1>Smart Campus Portal</h1>
        </Link>
        <nav>
          <ul className=" list-none">
            {user ? (
              <>
                <li>
                  Welcome, <span>{user.name || 'User '}</span>
                </li>
                {/* <li>
                  <Link to={`/${user.role}`}>
                    Dashboard
                  </Link>
                </li> */}
                <li>
                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-black no-underline visited:underline visited:text-blue-500">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="text-black no-underline visited:underline visited:text-blue-500">Register</Link>
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