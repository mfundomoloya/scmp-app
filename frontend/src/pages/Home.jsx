import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user, loading } = useContext(AuthContext);
  console.log('Home rendered'); // Debug

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-700">Loading...</div>;
  if (user) return <Navigate to={`/${user.role}`} />;

  return (
    <main className="flex-grow flex items-center justify-center bg-gray-100">
      <div className="text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Welcome to Smart Campus Services Portal
        </h1>
        <p className="md:p-6 text-lg md:text-xl text-gray-700 mb-8">
          Manage your campus services: Book rooms, view schedules, report issues, and stay updated.
        </p>
        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
          <a
            href="/register"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
};

export default Home;