import React, { createContext, useContext, ReactNode } from 'react';

interface AppContextType {
    // Add any global app state here
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    return (
        <AppContext.Provider value={{}}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};