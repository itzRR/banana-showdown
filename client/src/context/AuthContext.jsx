// ============================================================
//  Auth Context — Global virtual identity management
//  [VIRTUAL IDENTITY] — Provides user session to all components
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, username }
  const [loading, setLoading] = useState(true); // loading until session is checked

  // On app load, check if there's an existing session (JWT cookie)
  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Called after successful login/register
  function login(userData) {
    setUser(userData);
  }

  // Called on logout
  async function logout() {
    await api.post('/api/auth/logout', {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuth() {
  return useContext(AuthContext);
}
