import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Spinner, Center } from '@chakra-ui/react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // true = todos, false = al menos uno
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = true,
}: ProtectedRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { hasAllPermissions, hasAnyPermission, loading: permLoading } = usePermissions();

  if (authLoading || permLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="#00569c" />
      </Center>
    );
  }

  // No autenticado
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos si se especifican
  if (requiredPermission || requiredPermissions.length > 0) {
    const permsToCheck = requiredPermission ? [requiredPermission] : requiredPermissions;
    
    const hasAccess = requireAll
      ? hasAllPermissions(permsToCheck)
      : hasAnyPermission(permsToCheck);

    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};