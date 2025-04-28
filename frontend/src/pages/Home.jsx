import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user, loading } = useContext(AuthContext);
  console.log('Home rendered'); // Debug

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading...
      </div>
    );
  if (user) return <Navigate to={`/${user.role}`} />;

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-purple mb-6">
          Welcome to Smart Campus Services Portal
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Manage your campus services: Book rooms, view schedules, report
          issues, and stay updated.
        </p>

        <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-purple text-white rounded-lg shadow-md hover:bg-midnight transition duration-300"
          >
            Login
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-white text-purple border border-purple rounded-lg shadow-md hover:bg-silver transition duration-300"
          >
            Register
          </a>
        </div>
      </div>
    </main>
  );
};

export default Home;
