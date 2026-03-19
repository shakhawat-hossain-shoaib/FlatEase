import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

type ProtectedRouteProps = {
  allowedRole: 'admin' | 'tenant';
  children: React.ReactNode;
};

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/tenant'} replace />;
  }

  return <>{children}</>;
}