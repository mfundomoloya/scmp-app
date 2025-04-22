import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchNotifications = async () => {
    if (!user) {
        setNotifications([]); // Clear notifications if no user
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

  useEffect(() => {
    if (user) {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
      } else {
        setNotifications([]); // Clear notifications on logout
      }
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