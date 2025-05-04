import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

const Home = () => {
  const { user, loading } = useContext(AuthContext);
  console.log('Home rendered'); // Debug

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (user) return <Navigate to={`/${user.role}`} />;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-3xl w-full mx-auto px-4">
        <div className="bg-black bg-opacity-75 backdrop-blur-sm p-8 rounded-lg shadow-2xl text-white">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4 text-blue-400">
              Welcome to Smart Campus Services Portal
            </h1>
            <p className="text-xl text-gray-300">
              Manage your campus services: Book rooms, view schedules, report
              issues, and stay updated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 border border-blue-400 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 font-medium rounded-lg text-center transition-colors duration-200"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
