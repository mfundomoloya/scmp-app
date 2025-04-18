import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('API URL:', import.meta.env.VITE_API_URL); // Debug

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/auth/user`)
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Auth fetch error:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Logging in with:', { email });
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      console.log('Setting user with role:', res.data.user.role, 'name:', res.data.user.name);
      return res.data.user.role; // Return role for redirect in Login.jsx
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      console.log('Registering with:', { name, email, role });
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name,
        email,
        password,
        role,
      });
      console.log('Register response:', res.data);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
    } catch (err) {
      console.error('Register error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};