'use client';

import { useState, useEffect } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthResult {
    user: User | null;
    error: string | null;
}

export const useFirebaseAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { user: result.user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    };

    const signUp = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            return { user: result.user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    };

    const signInWithGoogle = async (): Promise<AuthResult> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return { user: result.user, error: null };
        } catch (error: any) {
            return { user: null, error: error.message };
        }
    };

    const logOut = async (): Promise<{ error: string | null }> => {
        try {
            await signOut(auth);
            return { error: null };
        } catch (error: any) {
            return { error: error.message };
        }
    };

    return {
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        logOut
    };
};
