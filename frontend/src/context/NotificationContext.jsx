import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import io from 'socket.io-client';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user, loading } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = async () => {
    if (!user || loading) {
      console.log('Fetch notifications: Skipping, no user or still loading', { user: !!user, loading });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Fetch notifications: No token found in localStorage');
      return;
    }
    try {
      console.log('Fetching notifications for user:', user.email);
      console.log('Request details:', {
        url: `${import.meta.env.VITE_API_URL}/api/notifications`,
        headers: { Authorization: `Bearer ${token.substring(0, 10)}...` },
      });
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Notifications fetched:', res.data);
      setNotifications(res.data);
    } catch (err) {
      console.error('Fetch notifications error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchNotifications();

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Socket setup: No token found');
        return;
      }
      const socketInstance = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        transports: ['websocket'],
      });
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id);
        socketInstance.emit('join', user.id);
      });

      socketInstance.on('newNotification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications((prev) => [...prev, notification]);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      socketInstance.on('connect_error', (err) => {
        console.log('Socket connect error:', err.message);
      });

      return () => {
        socketInstance.disconnect();
        console.log('Socket cleanup');
      };
    }
  }, [user, loading]);

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};