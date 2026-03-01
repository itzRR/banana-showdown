// ============================================================
//  ProtectedRoute — Redirects unauthenticated users to /login
//  [VIRTUAL IDENTITY] — Guards all game routes
// ============================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in — redirect to login page
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
