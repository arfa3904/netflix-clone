import { Navigate, useLocation } from 'react-router-dom';
import { getStoredUser } from '../services/auth';

export default function ProtectedRoute({ children }) {
  const user = getStoredUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
