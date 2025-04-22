import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { io } from 'socket.io-client';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  // WebSocket setup
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Initial fetch
    fetchNotifications();

    // WebSocket connection
    const socket = io(import.meta.env.VITE_API_URL);
    socket.emit('join', user.id);
    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};