import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(
    'AdminPanel: User:',
    user ? { id: user.id, role: user.role, name: user.name } : null
  );

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/stats`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        console.log('AdminPanel: Stats response:', JSON.stringify(response.data, null, 2));
        setStatistics([
          { label: 'Active Bookings', value: response.data.activeBookings },
          { label: 'Available Rooms', value: response.data.availableRooms },
          { label: 'Maintenance Issues', value: response.data.maintenanceIssues },
          { label: 'Users Registered', value: response.data.usersRegistered },
        ]);
      } catch (err) {
        console.error('AdminPanel: Fetch stats error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(err.response?.data?.msg || 'Failed to fetch statistics');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchStats();
    } else {
      setIsLoading(false);
      setError('Unauthorized access');
    }
  }, [user]);

  // Color variables
  const blueColor = '#1E40AF';
  const lightBlueColor = '#3B82F6';
  const hoverBlueColor = '#1E3A8A';
  const bgColor = '#F3F4F6';
  const cardBgColor = '#FFFFFF';
  const textColor = '#1F2937';
  const secondaryTextColor = '#4B5563';

  // Admin features
  const adminFeatures = [
    {
      id: 'bookings',
      title: 'Manage Bookings',
      description: 'Oversee and manage all room bookings across campus',
      icon: '📅',
      link: '/admin/bookings',
    },
    {
      id: 'rooms',
      title: 'Room Management',
      description: 'Add, edit, or remove rooms from the system',
      icon: '🏢',
      link: '/admin/rooms',
    },
    {
      id: 'import',
      title: 'Import Rooms',
      description: 'Bulk import room data via CSV files',
      icon: '📤',
      link: '/admin/rooms/import',
    },
    {
      id: 'maintenance',
      title: 'Maintenance Reports',
      description: 'View and manage maintenance requests',
      icon: '🔧',
      link: '/admin/maintenance',
    },
    {
      id: 'timetables',
      title: 'Timetable Management',
      description: 'Manage course schedules and timetables',
      icon: '🗓️',
      link: '/admin/timetables',
    },
    {
      id: 'timetable-import',
      title: 'Import Timetables',
      description: 'Bulk import timetable data',
      icon: '📥',
      link: '/admin/timetables/import',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        padding: '2rem 1.5rem',
        backgroundColor: bgColor,
        backgroundImage:
          "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: blueColor,
              marginBottom: '0.75rem',
            }}
          >
            {user ? `Welcome, ${user.name}` : 'Admin Panel'}
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: secondaryTextColor,
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Manage and oversee all campus operations from this central dashboard.
          </p>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div
              style={{
                border: `4px solid ${lightBlueColor}`,
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            ></div>
            <p style={{ color: secondaryTextColor, marginTop: '1rem' }}>
              Loading statistics...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            {error}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              marginBottom: '3rem',
            }}
          >
            {statistics.map((stat, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: cardBgColor,
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  flex: '1',
                  textAlign: 'center',
                  border: `1px solid ${lightBlueColor}`,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <h3
                  style={{
                    color: blueColor,
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {stat.value}
                </h3>
                <p style={{ color: secondaryTextColor }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            color: blueColor,
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Administrative Tools
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {adminFeatures.map((feature) => (
            <Link
              to={feature.link}
              key={feature.id}
              style={{ textDecoration: 'none' }}
              onMouseOver={() => setHoveredCard(feature.id)}
              onMouseOut={() => setHoveredCard(null)}
            >
              <div
                style={{
                  backgroundColor: cardBgColor,
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow:
                    hoveredCard === feature.id
                      ? '0 10px 15px rgba(0, 0, 0, 0.1)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  height: '100%',
                  border:
                    hoveredCard === feature.id
                      ? `2px solid ${blueColor}`
                      : `1px solid ${lightBlueColor}`,
                  transition:
                    'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease',
                  transform:
                    hoveredCard === feature.id ? 'translateY(-5px)' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '2rem',
                      marginRight: '0.75rem',
                    }}
                  >
                    {feature.icon}
                  </span>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: blueColor,
                    }}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p style={{ color: secondaryTextColor }}>
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div
          style={{
            backgroundColor: cardBgColor,
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: blueColor,
              marginBottom: '1rem',
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <Link
              to="/admin/bookings"
              style={{
                backgroundColor: lightBlueColor,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverBlueColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = lightBlueColor)
              }
            >
              Manage Bookings
            </Link>
            <Link
              to="/admin/rooms"
              style={{
                backgroundColor: lightBlueColor,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverBlueColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = lightBlueColor)
              }
            >
              Manage Rooms
            </Link>
            <Link
              to="/admin/maintenance"
              style={{
                backgroundColor: lightBlueColor,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverBlueColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = lightBlueColor)
              }
            >
              View Maintenance
            </Link>
            <Link
              to="/profile"
              style={{
                backgroundColor: lightBlueColor,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = hoverBlueColor)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = lightBlueColor)
              }
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div
          style={{
            backgroundColor: cardBgColor,
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: blueColor,
              marginBottom: '1rem',
            }}
          >
            System Status
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ color: textColor }}>Database</span>
            <span
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
              }}
            >
              Operational
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ color: textColor }}>API Services</span>
            <span
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
              }}
            >
              Operational
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ color: textColor }}>Authentication System</span>
            <span
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
              }}
            >
              Operational
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: textColor }}>Notification Service</span>
            <span
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
              }}
            >
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;