'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Get system theme
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Resolve the actual theme (system preference or user choice)
    const resolveTheme = (selectedTheme: Theme): 'light' | 'dark' => {
        if (selectedTheme === 'system') {
            return getSystemTheme();
        }
        return selectedTheme;
    };

    // Apply theme to document
    const applyTheme = (newTheme: 'light' | 'dark') => {
        if (typeof document === 'undefined') return;

        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Initialize theme on mount
    useEffect(() => {
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        const initialTheme = savedTheme && ['light', 'dark', 'system'].includes(savedTheme)
            ? savedTheme
            : 'system';

        setThemeState(initialTheme);
        const resolved = resolveTheme(initialTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const newResolvedTheme = getSystemTheme();
            setResolvedTheme(newResolvedTheme);
            applyTheme(newResolvedTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Update resolved theme when theme changes
    useEffect(() => {
        const newResolvedTheme = resolveTheme(theme);
        setResolvedTheme(newResolvedTheme);
        applyTheme(newResolvedTheme);

        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => {
            // If currently system, check what the resolved theme is and go to the opposite
            if (prev === 'system') {
                return resolvedTheme === 'light' ? 'dark' : 'light';
            }
            // Direct toggle between light and dark
            if (prev === 'light') return 'dark';
            return 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
