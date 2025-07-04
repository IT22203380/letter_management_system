import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute: React.FC = (): JSX.Element => {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check if we're still loading the auth state
        const checkAuth = async (): Promise<void> => {
            // Add a small delay to ensure localStorage is checked
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};