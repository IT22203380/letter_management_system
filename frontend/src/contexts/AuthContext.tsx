import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
    username: string;
    role: 'dataEntry' | 'ao';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, role: 'dataEntry' | 'ao') => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for existing user in localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse user data', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = (username: string, role: 'dataEntry' | 'ao') => {
        const userData = { username, role };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
