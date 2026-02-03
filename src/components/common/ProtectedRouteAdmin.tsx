import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '@chakra-ui/react';

export const ProtectedRouteAdmin = ({ children }: { children: React.ReactNode }) => {
  const { session, isAdmin, loading } = useAuth();

  if (loading) {
    return <Spinner 
            size="xl" 
            position="fixed" 
            top="50%" 
            left="50%" 
            transform="translate(-50%, -50%)" 
            />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};