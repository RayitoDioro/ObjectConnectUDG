import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { session, loading } = useAuth();

    if (loading) return null; // O un spinner

    return session ? children : <Navigate to="/login" replace />;
};