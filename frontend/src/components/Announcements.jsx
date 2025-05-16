import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import announcementIcon from '../assets/announcement.png';
import backgroundImage from '../assets/AnnouncementB.jpeg';

const Announcement = () => {
  // Define colors explicitly to match Footer
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/announcements`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setAnnouncements(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
    // Set up polling for new announcements every 5 minutes
    const interval = setInterval(fetchAnnouncements, 300000);
    return () => clearInterval(interval);
  }, []);

  // Example announcements for display if API isn't connected
  const demoAnnouncements = [
    {
      id: 1,
      title: 'Campus Wi-Fi Maintenance',
      content:
        'Campus Wi-Fi will be undergoing maintenance on Saturday from 2AM to 5AM. Please plan accordingly.',
      category: 'maintenance',
      createdAt: '2025-05-10T08:00:00Z',
    },
    {
      id: 2,
      title: 'Library Extended Hours',
      content:
        'The main library will extend hours during finals week (May 20-27) and remain open until midnight.',
      category: 'academic',
      createdAt: '2025-05-12T10:30:00Z',
    },
    {
      id: 3,
      title: 'New Room Booking System',
      content:
        "We've updated our room booking system with new features! Check the tutorial for details.",
      category: 'system',
      createdAt: '2025-05-14T14:15:00Z',
      link: '/bookings',
    },
  ];

  // Use API data if available, otherwise use demo announcements
  const displayAnnouncements =
    announcements.length > 0 ? announcements : demoAnnouncements;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'academic':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'system':
        return 'bg-[#dbeafe] text-[#1d4ed8] border-blue-300';
      case 'event':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 my-8 max-w-5xl mx-auto">
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: blueColor }}
        >
          Campus Announcements
        </h2>
        <div className="flex justify-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: mediumBlueColor }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-6">
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="mr-4 w-16 h-16 flex-shrink-0">
                <img
                  src={announcementIcon}
                  alt="Announcements"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2
                className="text-2xl font-bold pb-2"
                style={{
                  color: blueColor,
                  borderBottom: `1px solid ${lightBlueColor}`,
                }}
              >
                Campus Announcements
              </h2>
            </div>
            {user && user.role === 'admin' && (
              <Link
                to="/admin/announcements/new"
                className="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                style={{ backgroundColor: mediumBlueColor }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = blueColor)
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = mediumBlueColor)
                }
              >
                Create Announcement
              </Link>
            )}
          </div>

          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
              role="alert"
            >
              <p>{error}</p>
            </div>
          )}

          {displayAnnouncements.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">
                No announcements available at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md"
                  style={{
                    borderColor: lightBlueColor,
                    backgroundColor: veryLightBlueColor,
                  }}
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3
                          className="text-xl font-semibold"
                          style={{ color: blueColor }}
                        >
                          {announcement.title}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${getCategoryStyle(
                            announcement.category
                          )} border`}
                        >
                          {announcement.category}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {announcement.content}
                      </p>
                      {announcement.link && (
                        <Link
                          to={announcement.link}
                          className="inline-flex items-center font-medium"
                          style={{
                            color: mediumBlueColor,
                            transition: 'color 0.3s',
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.color = blueColor)
                          }
                          onMouseOut={(e) =>
                            (e.target.style.color = mediumBlueColor)
                          }
                        >
                          <span>Learn more</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider - Similar to Footer */}
        <div
          style={{
            borderTop: `1px solid ${lightBlueColor}`,
            marginTop: '2rem',
          }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div
            style={{ backgroundColor: veryLightBlueColor }}
            className="py-3 px-8 rounded-b-lg text-center"
          >
            <p className="text-sm text-gray-600">
              Stay updated with the latest campus announcements and events.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
