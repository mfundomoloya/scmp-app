import React, { useContext, useEffect } from 'react';
import { NotificationContext } from '../context/NotificationContext';

const Notifications = () => {
  // Define colors explicitly as in the Footer component
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const veryLightBlueColor = '#eff6ff'; // blue-50 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent
  const redColor = '#dc2626'; // red-600 equivalent
  const greenColor = '#16a34a'; // green-600 equivalent
  const amberColor = '#f59e0b'; // amber-500 equivalent
  const grayColor = '#6b7280'; // gray-500 equivalent
  const darkGrayColor = '#374151'; // gray-700 equivalent

  const { notifications, fetchNotifications } = useContext(NotificationContext);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: veryLightBlueColor,
          borderRadius: '0.5rem',
          textAlign: 'center',
          color: grayColor,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        No notifications
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: blueColor,
          marginBottom: '1rem',
          textAlign: 'center',
          paddingBottom: '0.5rem',
          borderBottom: `2px solid ${lightBlueColor}`,
        }}
      >
        Modern Styled Notifications
      </h2>

      <div
        style={{
          maxWidth: '42rem',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {notifications.map((notification) => {
          // Determine notification styling based on status
          let textColor = mediumBlueColor;
          let borderColor = mediumBlueColor;
          let statusText = '';

          if (notification.status === 'cancelled') {
            textColor = redColor;
            borderColor = redColor;
            statusText = 'cancelled';
          } else if (notification.status === 'updated') {
            textColor = greenColor;
            borderColor = greenColor;
            statusText = 'updated to confirmed';
          } else if (notification.status === 'scheduled') {
            textColor = amberColor;
            borderColor = amberColor;
            statusText = 'scheduled';
          }

          // Extract message parts - this assumes a specific format in the notifications
          const messageContent = notification.message || '';

          // Parse message content - this would be more robust with actual data structure
          let booking = {
            type: messageContent.includes('Maintenance')
              ? 'Maintenance'
              : 'Your booking',
            room: messageContent.includes('Room A')
              ? 'Seminar Room A'
              : 'Seminar Room B',
            date: messageContent.match(/\d{2}-\d{2}-\d{4}/)?.[0] || '',
            startTime: messageContent.match(/from (\d{2}:\d{2})/)?.[1] || '',
            endTime: messageContent.match(/to (\d{2}:\d{2})/)?.[1] || '',
          };

          return (
            <div
              key={notification.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                overflow: 'hidden',
                borderLeft: `4px solid ${borderColor}`,
              }}
            >
              <div style={{ width: '0.25rem', flexShrink: 0 }}></div>
              <div style={{ padding: '1rem', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, marginRight: '0.75rem' }}>
                    <svg
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        color: borderColor,
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <p style={{ color: darkGrayColor }}>
                      {booking.type} for {booking.room} on {booking.date} from{' '}
                      {booking.startTime} to {booking.endTime} has been{' '}
                      <span style={{ color: textColor }}>{statusText}</span>.
                    </p>
                    <p
                      style={{
                        color: grayColor,
                        fontSize: '0.875rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '1rem',
                }}
              >
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  style={{
                    color: mediumBlueColor,
                    transition: 'color 0.3s',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => (e.target.style.color = blueColor)}
                  onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
                >
                  Mark as Read
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
