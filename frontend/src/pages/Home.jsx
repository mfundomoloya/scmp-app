import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
//import studentGradImage from '../assets/studentgr.jpg';
import lectureHallImage from '../assets/lecture-hall.jpg';
import gradImage from '../assets/GRA.webp';

const Home = () => {
  const { user, loading } = useContext(AuthContext);
  console.log('Home rendered'); // Debug

  // Define explicit colors to match Footer component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: mediumBlueColor }}
        ></div>
      </div>
    );

  if (user) return <Navigate to={`/${user.role}`} />;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center bg-cover bg-center min-h-[70vh]"
        style={{
          backgroundImage: `url(${gradImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl w-full mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white leading-tight">
            Welcome to <span className="text-blue-400">Smart Campus</span>{' '}
            Services Portal
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Your all-in-one digital platform for managing campus resources
            efficiently. Book rooms, view schedules, report issues, and stay
            connected.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-medium rounded-lg text-center transition-colors duration-200 transform hover:scale-105 shadow-lg border border-blue-600"
              style={{ color: blueColor }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-medium rounded-lg text-center transition-colors duration-200 transform hover:scale-105 shadow-lg border border-blue-600"
              style={{ color: blueColor }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: blueColor }}
          >
            Smart Campus Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              className="rounded-xl p-6 shadow-md transition-transform duration-300 hover:transform hover:scale-105"
              style={{ backgroundColor: veryLightBlueColor }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
                style={{ backgroundColor: lightBlueColor }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: mediumBlueColor }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-center mb-2"
                style={{ color: blueColor }}
              >
                Smart Scheduling
              </h3>
              <p className="text-gray-600 text-center">
                Easily book rooms with our intelligent scheduling system that
                optimizes space utilization across campus.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="rounded-xl p-6 shadow-md transition-transform duration-300 hover:transform hover:scale-105"
              style={{ backgroundColor: veryLightBlueColor }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
                style={{ backgroundColor: lightBlueColor }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: mediumBlueColor }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-center mb-2"
                style={{ color: blueColor }}
              >
                Maintenance Reporting
              </h3>
              <p className="text-gray-600 text-center">
                Report and track maintenance issues ensuring quick resolution
                and maintaining campus facilities.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="rounded-xl p-6 shadow-md transition-transform duration-300 hover:transform hover:scale-105"
              style={{ backgroundColor: veryLightBlueColor }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
                style={{ backgroundColor: lightBlueColor }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: mediumBlueColor }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold text-center mb-2"
                style={{ color: blueColor }}
              >
                The Campus Announcements
              </h3>
              <p className="text-gray-600 text-center">
                Get all the upcoming events through our announcements
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section
        className="py-16"
        style={{ backgroundColor: veryLightBlueColor }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: blueColor }}
              >
                We serve what is best
              </h2>
              <p className="text-gray-600 mb-6">
                Our Smart Campus aims at making sure that bookings
                ,Announcements and courses.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: '#22c55e' }} // green-500
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Announcements</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: '#22c55e' }} // green-500
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>TimeTables</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    style={{ color: '#22c55e' }} // green-500
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Bookigs</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div
                style={{ backgroundColor: '#ffffff' }}
                className="p-6 rounded-xl shadow-lg"
              >
                <div className="rounded-lg mb-4 overflow-hidden">
                  <img
                    src={lectureHallImage}
                    alt="Lecture Hall"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: blueColor }}
                >
                  Smart Campus
                </h3>
                <p className="text-gray-600">
                  Be part of our campus-wide effort to create a more sustainable
                  and environmentally friendly academic environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
