import React from 'react';
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
      console.log('Fetching notifications for user:', user.id);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      console.log('Fetched notifications:', response.data);
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
    const socket = io(import.meta.env.VITE_API_URL, {
      transports: ['websocket'], // Prefer WebSocket over polling
      reconnectionAttempts: 5, // Limit reconnection attempts
      reconnectionDelay: 1000, // Delay between reconnections
    });
    socket.emit('join', user.id);
    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      setNotifications((prev) => [notification, ...prev]);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      console.log('Disconnecting Socket.IO');
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