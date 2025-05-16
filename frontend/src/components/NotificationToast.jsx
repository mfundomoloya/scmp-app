import React, { useContext, useEffect, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { createPortal } from 'react-dom';

const NotificationToast = () => {
  // Define colors explicitly to match Footer.jsx approach
  const blueColor = '#1d4ed8'; // blue-700 equivalent
  //const lightBlueColor = '#dbeafe'; // blue-100 equivalent
  const mediumBlueColor = '#2563eb'; // blue-600 equivalent
  const redColor = '#dc2626'; // red-600 equivalent
  const greenColor = '#16a34a'; // green-600 equivalent

  const { notifications, fetchNotifications } = useContext(NotificationContext);
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [portalElement, setPortalElement] = useState(null);

  // Find or create portal element on mount
  useEffect(() => {
    let element = document.getElementById('notification-portal');
    if (!element) {
      element = document.createElement('div');
      element.id = 'notification-portal';
      element.style.position = 'fixed';
      element.style.top = '1rem';
      element.style.right = '1rem';
      element.style.zIndex = '50';
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.gap = '0.5rem';
      element.style.maxWidth = '24rem';
      document.body.appendChild(element);
    }
    setPortalElement(element);

    return () => {
      if (element && element.parentElement) {
        element.parentElement.removeChild(element);
      }
    };
  }, []);

  // Add keyframes for animation
  useEffect(() => {
    if (!document.getElementById('notification-keyframes')) {
      const style = document.createElement('style');
      style.id = 'notification-keyframes';
      style.innerHTML = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Show new notifications as toasts
  useEffect(() => {
    // Filter unread notifications that aren't already visible
    const unreadIds = visibleNotifications.map((n) => n.id);
    const newNotifications = notifications
      .filter((n) => !n.read && !unreadIds.includes(n.id))
      .slice(0, 3); // Limit to 3 new notifications at once

    if (newNotifications.length > 0) {
      setVisibleNotifications((prev) => [...prev, ...newNotifications]);

      // Auto-dismiss after 5 seconds
      newNotifications.forEach((notification) => {
        setTimeout(() => {
          setVisibleNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, 5000);
      });
    }
  }, [notifications]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleDismiss = (id) => {
    setVisibleNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      handleDismiss(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatMessage = (message) => {
    if (message.includes('cancelled')) {
      const parts = message.split('cancelled');
      return (
        <>
          {parts[0]}
          <span style={{ color: redColor }}>cancelled</span>
          {parts[1]}
        </>
      );
    } else if (message.includes('updated to confirmed')) {
      const parts = message.split('updated to confirmed');
      return (
        <>
          {parts[0]}
          <span style={{ color: greenColor }}>updated to confirmed</span>
          {parts[1]}
        </>
      );
    }
    return message;
  };

  if (!portalElement || visibleNotifications.length === 0) {
    return null;
  }

  return createPortal(
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '0.25rem',
            borderLeft: `4px solid ${mediumBlueColor}`,
            padding: '0.75rem 1rem',
            boxShadow:
              '0 2px 5px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)',
            animation: 'slideInRight 0.3s ease-out forwards',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          <button
            onClick={() => handleDismiss(notification.id)}
            style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              color: '#9ca3af',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'color 0.2s',
              fontSize: '0.75rem',
              padding: '0.25rem',
            }}
            onMouseOver={(e) => (e.target.style.color = '#6b7280')}
            onMouseOut={(e) => (e.target.style.color = '#9ca3af')}
          >
            ✕
          </button>

          <p
            style={{
              margin: '0 0 0.25rem 0',
              color: '#1f2937',
              fontSize: '0.95rem',
              paddingRight: '1rem',
            }}
          >
            {formatMessage(notification.message)}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: '#6b7280',
              }}
            >
              ({notification.timestamp})
            </span>

            <button
              onClick={() => handleMarkAsRead(notification.id)}
              style={{
                color: mediumBlueColor,
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '0.8rem',
                padding: '0',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.target.style.color = blueColor)}
              onMouseOut={(e) => (e.target.style.color = mediumBlueColor)}
            >
              Mark as Read
            </button>
          </div>
        </div>
      ))}
    </div>,
    portalElement
  );
};

export default NotificationToast;
