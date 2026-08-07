import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (token && email) {
      setUser({ email, role });
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    setUser({ email: data.email, role: data.role });
    return data;
  }

  async function register(email, password, firstName, lastName) {
    const data = await api.post('/auth/register', { email, password, firstName, lastName });
    localStorage.setItem('token', data.token);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    setUser({ email: data.email, role: data.role });
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}