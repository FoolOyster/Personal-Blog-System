import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}
