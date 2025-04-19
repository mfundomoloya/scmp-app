import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Home = () => {
  const { user, loading } = useContext(AuthContext);
  console.log('Home rendered'); // Debug

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-700">Loading...</div>;
  if (user) return <Navigate to={`/${user.role}`} />;

  return (
    <main >
      <div >
        <h1 >
          Welcome to Smart Campus Services Portal
        </h1>
        <p>
          Manage your campus services: Book rooms, view schedules, report issues, and stay updated.
        </p>
      </div>
    </main>
  );
};

export default Home;