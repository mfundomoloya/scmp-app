import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(
    'https://placehold.co/100x100'
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  console.log('ProfileSettings: Initial render');

  // Color variables for consistency
  const lightBlueColor = '#3B82F6';
  const hoverBlueColor = '#1E3A8A';
  const darkColor = '#111827';
  const grayColor = '#374151';
  const lightGrayColor = '#6B7280';
  const borderColor = '#4B5563';
  const inputBgColor = '#1F2937';
  const cardBgColor = '#1F2937';
  const pageBgColor = '#111827';
  const successColor = '#059669';
  const errorColor = '#DC2626';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('ProfileSettings: No token found');
          throw new Error('Please log in again');
        }

        console.log('ProfileSettings: Fetching user profile and courses');
        const [userResponse, coursesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log(
          'ProfileSettings: Fetched user profile:',
          JSON.stringify(userResponse.data, null, 2)
        );
        console.log(
          'ProfileSettings: Fetched courses:',
          JSON.stringify(coursesResponse.data, null, 2)
        );

        setProfile(userResponse.data);
        setSelectedCourses(userResponse.data.courseCodes || []);
        setEmailNotifications(
          userResponse.data.notificationPreferences.emailNotifications
        );
        setDisplayName(
          userResponse.data.displayName ||
            `${userResponse.data.firstName} ${userResponse.data.lastName}`
        );
        setCurrentAvatar(
          userResponse.data.avatar &&
            userResponse.data.avatar.startsWith('http')
            ? userResponse.data.avatar
            : userResponse.data.avatar
            ? `${import.meta.env.VITE_API_URL}/${userResponse.data.avatar}`
            : 'https://placehold.co/100x100'
        );
        setCourses(coursesResponse.data);
      } catch (err) {
        console.error('ProfileSettings: Error fetching data:', err);
        setError(err.response?.data?.msg || 'Error fetching profile data');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleCourseChange = (code) => {
    console.log('ProfileSettings: Course toggled:', code);
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('ProfileSettings: File selected:', file?.name);
    setAvatar(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('ProfileSettings: Submitting form');
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('ProfileSettings: No token found');
        throw new Error('Please log in again');
      }

      const formData = new FormData();
      formData.append('courseCodes', JSON.stringify(selectedCourses));
      formData.append('emailNotifications', emailNotifications);
      formData.append('displayName', displayName);
      if (avatar) formData.append('avatar', avatar);

      console.log('ProfileSettings: Sending form data');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(
        'ProfileSettings: Updated profile:',
        JSON.stringify(response.data, null, 2)
      );
      setSuccess('Profile updated successfully!');
      setProfile(response.data);
      setCurrentAvatar(
        response.data.avatar && response.data.avatar.startsWith('http')
          ? response.data.avatar
          : response.data.avatar
          ? `${import.meta.env.VITE_API_URL}/${response.data.avatar}`
          : 'https://placehold.co/100x100'
      );

      // Scroll to the top where the success message is displayed
      if (messagesRef.current) {
        messagesRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      // Navigate to timetable to reflect updated courses
      setTimeout(() => navigate('/timetable'), 1000);
    } catch (err) {
      console.error('ProfileSettings: Error updating profile:', err);
      setError(err.response?.data?.msg || 'Error updating profile');
      if (messagesRef.current) {
        messagesRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '2rem',
          background: `linear-gradient(135deg, ${darkColor} 0%, ${grayColor} 100%)`,
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(3, 12, 199, 0.5)',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            boxShadow:
              '0 10px 15px -3px rgba(110, 164, 249, 0.1), 0 4px 6px -2px rgba(132, 142, 226, 0.05)',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Authentication Required
          </h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Please log in to view and manage your profile settings.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              backgroundColor: lightBlueColor,
              color: '#FFFFFF',
              fontWeight: '600',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = hoverBlueColor)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = lightBlueColor)
            }
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: pageBgColor,
        backgroundImage:
          "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '3rem 1rem',
        position: 'relative',
      }}
    >
      {/* Background Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.85)',
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            backgroundColor: darkColor,
            borderRadius: '0.75rem',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.5rem 2rem',
              borderBottom: `1px solid ${borderColor}`,
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#FFFFFF',
                margin: 0,
              }}
            >
              Profile Settings
            </h2>
          </div>

          {/* Message notifications */}
          <div ref={messagesRef} style={{ padding: '0 2rem' }}>
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.2)',
                  color: '#FFFFFF',
                  border: `1px solid ${errorColor}`,
                  borderRadius: '0.375rem',
                  padding: '1rem',
                  margin: '1.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    marginRight: '0.75rem',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div
                style={{
                  backgroundColor: 'rgba(5, 150, 105, 0.2)',
                  color: '#FFFFFF',
                  border: `1px solid ${successColor}`,
                  borderRadius: '0.375rem',
                  padding: '1rem',
                  margin: '1.5rem 0',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    marginRight: '0.75rem',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem 2rem 2rem' }}>
            {loading ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '3rem 0',
                }}
              >
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    border: `4px solid ${lightBlueColor}`,
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '1rem',
                  }}
                ></div>
                <span style={{ fontSize: '1.25rem', color: '#FFFFFF' }}>
                  Loading profile data...
                </span>

                <style jsx>{`
                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            ) : profile ? (
              <div style={{ color: '#FFFFFF' }}>
                {/* Personal Information Section */}
                <div
                  style={{
                    backgroundColor: cardBgColor,
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem',
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: lightBlueColor,
                      marginTop: 0,
                      marginBottom: '1.25rem',
                      paddingBottom: '0.75rem',
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    Personal Information
                  </h3>

                  <div
                    style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}
                  >
                    <div
                      style={{
                        flex: '1 1 300px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            color: lightGrayColor,
                            marginRight: '0.5rem',
                          }}
                        >
                          Name:
                        </span>
                        <span>
                          {profile.firstName} {profile.lastName}
                        </span>
                      </div>
                      <div>
                        <span
                          style={{
                            color: lightGrayColor,
                            marginRight: '0.5rem',
                          }}
                        >
                          Email:
                        </span>
                        <span>{profile.email}</span>
                      </div>
                      <div>
                        <span
                          style={{
                            color: lightGrayColor,
                            marginRight: '0.5rem',
                          }}
                        >
                          Role:
                        </span>
                        <span
                          style={{
                            backgroundColor: lightBlueColor,
                            color: '#FFFFFF',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {profile.role}
                        </span>
                      </div>
                    </div>

                    {currentAvatar && (
                      <div
                        style={{
                          flex: '0 0 auto',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: `3px solid ${lightBlueColor}`,
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <img
                            src={currentAvatar}
                            alt="Profile avatar"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {user.role === 'student' && (
                  <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div style={{ display: 'grid', gap: '2rem' }}>
                      {/* Select Courses Section */}
                      <div
                        style={{
                          backgroundColor: cardBgColor,
                          padding: '1.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: lightBlueColor,
                            marginTop: 0,
                            marginBottom: '1.25rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          Select Courses
                        </h3>

                        {courses.length === 0 ? (
                          <p style={{ color: lightGrayColor }}>
                            No courses available
                          </p>
                        ) : (
                          <div
                            style={{
                              maxHeight: '250px',
                              overflowY: 'auto',
                              padding: '1rem',
                              backgroundColor: 'rgba(17, 24, 39, 0.5)',
                              borderRadius: '0.5rem',
                              border: `1px solid ${borderColor}`,
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '1rem',
                              }}
                            >
                              {courses.map((course) => (
                                <div
                                  key={course.code}
                                  style={{
                                    backgroundColor: selectedCourses.includes(
                                      course.code
                                    )
                                      ? 'rgba(59, 130, 246, 0.2)'
                                      : 'transparent',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    border: selectedCourses.includes(
                                      course.code
                                    )
                                      ? `1px solid ${lightBlueColor}`
                                      : `1px solid ${borderColor}`,
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedCourses.includes(
                                        course.code
                                      )}
                                      onChange={() =>
                                        handleCourseChange(course.code)
                                      }
                                      style={{
                                        width: '1.25rem',
                                        height: '1.25rem',
                                        accentColor: lightBlueColor,
                                        cursor: 'pointer',
                                      }}
                                    />
                                    <div>
                                      <div style={{ fontWeight: '600' }}>
                                        {course.code}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: '0.875rem',
                                          color: lightGrayColor,
                                        }}
                                      >
                                        {course.name}
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notification Preferences Section */}
                      <div
                        style={{
                          backgroundColor: cardBgColor,
                          padding: '1.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: lightBlueColor,
                            marginTop: 0,
                            marginBottom: '1.25rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          Notification Preferences
                        </h3>

                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(17, 24, 39, 0.5)',
                            borderRadius: '0.375rem',
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={(e) => {
                              console.log(
                                'ProfileSettings: Email notifications toggled:',
                                e.target.checked
                              );
                              setEmailNotifications(e.target.checked);
                            }}
                            style={{
                              width: '1.25rem',
                              height: '1.25rem',
                              accentColor: lightBlueColor,
                              cursor: 'pointer',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              Email Notifications
                            </div>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                color: lightGrayColor,
                              }}
                            >
                              Receive email notifications for timetable changes
                              and important updates
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Display Name Section */}
                      <div
                        style={{
                          backgroundColor: cardBgColor,
                          padding: '1.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: lightBlueColor,
                            marginTop: 0,
                            marginBottom: '1.25rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          Display Name
                        </h3>

                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => {
                            console.log(
                              'ProfileSettings: Display name changed:',
                              e.target.value
                            );
                            setDisplayName(e.target.value);
                          }}
                          placeholder="Enter display name"
                          maxLength={50}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            backgroundColor: inputBgColor,
                            color: '#FFFFFF',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '0.375rem',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = lightBlueColor)
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = borderColor)
                          }
                        />
                        <p
                          style={{
                            marginTop: '0.5rem',
                            fontSize: '0.875rem',
                            color: lightGrayColor,
                          }}
                        >
                          This name will be displayed to other users across the
                          platform
                        </p>
                      </div>

                      {/* Profile Picture Section */}
                      <div
                        style={{
                          backgroundColor: cardBgColor,
                          padding: '1.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${borderColor}`,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: lightBlueColor,
                            marginTop: 0,
                            marginBottom: '1.25rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `1px solid ${borderColor}`,
                          }}
                        >
                          Profile Picture
                        </h3>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          {currentAvatar && (
                            <div
                              style={{
                                flex: '0 0 auto',
                              }}
                            >
                              <div
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  border: `3px solid ${lightBlueColor}`,
                                  boxShadow:
                                    '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                }}
                              >
                                <img
                                  src={currentAvatar}
                                  alt="Profile avatar"
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div style={{ flex: '1 1 300px' }}>
                            <div
                              style={{
                                position: 'relative',
                                width: '100%',
                              }}
                            >
                              <label
                                htmlFor="avatar-upload"
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  padding: '0.75rem 1rem',
                                  backgroundColor: inputBgColor,
                                  color: '#FFFFFF',
                                  border: `1px solid ${borderColor}`,
                                  borderRadius: '0.375rem',
                                  cursor: 'pointer',
                                  textAlign: 'center',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseOver={(e) =>
                                  (e.target.style.backgroundColor =
                                    'rgba(55, 65, 81, 1)')
                                }
                                onMouseOut={(e) =>
                                  (e.target.style.backgroundColor =
                                    inputBgColor)
                                }
                              >
                                <span
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    style={{
                                      width: '1.25rem',
                                      height: '1.25rem',
                                      marginRight: '0.5rem',
                                    }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  Upload New Image
                                </span>
                              </label>
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleFileChange}
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  padding: 0,
                                  margin: '-1px',
                                  overflow: 'hidden',
                                  clip: 'rect(0, 0, 0, 0)',
                                  border: 0,
                                }}
                              />
                            </div>
                            <p
                              style={{
                                marginTop: '0.5rem',
                                fontSize: '0.875rem',
                                color: lightGrayColor,
                              }}
                            >
                              JPEG or PNG, max 5MB
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          type="submit"
                          style={{
                            width: '100%',
                            padding: '0.875rem 1.5rem',
                            backgroundColor: lightBlueColor,
                            color: '#FFFFFF',
                            fontWeight: '600',
                            fontSize: '1rem',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                          }}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = hoverBlueColor)
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = lightBlueColor)
                          }
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {user.role === 'admin' && (
                  <div
                    style={{
                      backgroundColor: cardBgColor,
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: lightBlueColor,
                        marginTop: 0,
                        marginBottom: '1.25rem',
                        paddingBottom: '0.75rem',
                        borderBottom: `1px solid ${borderColor}`,
                      }}
                    >
                      Admin Controls
                    </h3>

                    <p style={{ marginBottom: '1.5rem' }}>
                      Manage system settings and users from these quick links:
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <AdminControlLink
                        to="/admin/users"
                        label="Manage Users"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{ width: '1.25rem', height: '1.25rem' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        }
                      />
                      <AdminControlLink
                        to="/admin/maintenance"
                        label="Maintenance Reports"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{ width: '1.25rem', height: '1.25rem' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                            />
                          </svg>
                        }
                      />
                      <AdminControlLink
                        to="/admin/rooms"
                        label="Manage Rooms"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{ width: '1.25rem', height: '1.25rem' }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 0',
                  color: lightGrayColor,
                }}
              >
                <p>No profile data available.</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#374151',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = '#4B5563')
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = '#374151')
                  }
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Control Link Component
const AdminControlLink = ({ to, label, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const lightBlueColor = '#3B82F6';
  const hoverBlueColor = '#1E3A8A';

  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isHovered ? hoverBlueColor : lightBlueColor,
        color: '#FFFFFF',
        padding: '0.875rem 1rem',
        borderRadius: '0.375rem',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon}
      <span style={{ marginLeft: '0.5rem' }}>{label}</span>
    </Link>
  );
};

export default ProfileSettings;
