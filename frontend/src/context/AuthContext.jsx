import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Loading user from token:', token.substring(0, 10) + '...');
          const decoded = jwtDecode(token);
          console.log('Decoded token:', decoded);
          if (decoded.exp * 1000 < Date.now()) {
            console.log('Token expired, logging out');
            logout();
            return;
          }
          axios.defaults.headers.common['x-auth-token'] = token;
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
          console.log('User loaded from backend:', res.data);
          if (res.data.role !== decoded.user.role) {
            console.warn('Role mismatch:', { backend: res.data.role, token: decoded.user.role });
            logout();
            return;
          }
          setUser({
            id: res.data.id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
          });
        } catch (err) {
          console.error('Load user error:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Logging in:', { email });
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      console.log('Login response:', { token: res.data.token.substring(0, 10) + '...', user: res.data.user });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      const userData = res.data.user;
      if (!userData.role || !userData.name) {
        console.error('Missing role or name in userData:', userData);
        throw new Error('User role or name not provided');
      }
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      navigate(userData.role === 'admin' ? '/admin' : userData.role === 'lecturer' ? '/lecturer' : '/student');
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      throw err;
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};