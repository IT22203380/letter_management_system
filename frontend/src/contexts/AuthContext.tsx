import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
    username: string;
    role: 'dataEntry' | 'ao';
    nic: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: { username: string; role: string; nic: string }) => void;
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
                // Map role from backend format to frontend format
                const mappedUser = {
                    ...userData,
                    role: userData.role === 'admin' ? 'ao' : 'dataEntry'
                };
                setUser(mappedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse user data', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const login = (userData: { username: string; role: string; nic: string }) => {
        // Map role from backend format to frontend format
        const mappedUser = {
            username: userData.username,
            nic: userData.nic,
            role: userData.role === 'admin' ? 'ao' : 'dataEntry'
        };
        setUser(mappedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(mappedUser));
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
