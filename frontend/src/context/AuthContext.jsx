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
          console.log('Load user: Raw token:', token.substring(0, 10) + '...');
          const decoded = jwtDecode(token);
          console.log('Load user: Decoded token:', JSON.stringify(decoded, null, 2));
          if (decoded.exp * 1000 < Date.now()) {
            console.log('Load user: Token expired, logging out');
            logout();
            return;
          }
          const tokenUser = decoded.user || decoded;
          if (!tokenUser.id) {
            console.error('Load user: Missing id in decoded token:', tokenUser);
            throw new Error('Invalid token: missing user ID');
          }
          if (!/^[0-9a-fA-F]{24}$/.test(tokenUser.id)) {
            console.error('Load user: Invalid user ID format in token:', tokenUser.id);
            throw new Error('Invalid user ID format in token');
          }
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
          console.log('Load user: User loaded from backend:', JSON.stringify(res.data, null, 2));
          if (res.data.role !== tokenUser.role) {
            console.warn('Load user: Role mismatch:', { backend: res.data.role, token: tokenUser.role });
            logout();
            return;
          }
          if (!/^[0-9a-fA-F]{24}$/.test(res.data.id)) {
            console.error('Load user: Invalid user ID format from backend:', res.data.id);
            throw new Error('Invalid user ID format from backend');
          }
          setUser({
            id: res.data.id,
            name: res.data.displayName,
            email: res.data.email,
            role: res.data.role,
          });
        } catch (err) {
          console.error('Load user error:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('Load user: No token found');
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
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      const userData = res.data.user;
      if (!userData.role || !userData.displayName || !userData.id) {
        console.error('Login: Missing role, name, or id in userData:', userData);
        throw new Error('User role, name, or ID not provided');
      }
      if (!/^[0-9a-fA-F]{24}$/.test(userData.id)) {
        console.error('Login: Invalid user ID format in login response:', userData.id);
        throw new Error('Invalid user ID format in login response');
      }
      setUser({
        id: userData.id,
        name: userData.displayName,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar || null,
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
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};