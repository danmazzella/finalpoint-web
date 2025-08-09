'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { User } from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
    signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
    logOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const auth = useFirebaseAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
