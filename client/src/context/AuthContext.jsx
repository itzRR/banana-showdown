// ============================================================
//  Auth Context — Global virtual identity management
//  [VIRTUAL IDENTITY] — Provides user session to all components
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, username }
  const [loading, setLoading] = useState(true); // loading until session is checked

  // On app load, check if there's an existing session (JWT cookie)
  useEffect(() => {
    axios.get('/api/auth/me', { withCredentials: true })
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
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
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
