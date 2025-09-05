'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface FeatureFlagContextType {
    isChatFeatureEnabled: boolean;
    isPositionChangesEnabled: boolean;
    isLoading: boolean;
    refreshFlags: () => Promise<void>;
    getAllFlags: () => Record<string, any>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
    children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isChatFeatureEnabled, setIsChatFeatureEnabled] = useState(false);
    const [isPositionChangesEnabled, setIsPositionChangesEnabled] = useState(false);
    const { user } = useAuth();

    const refreshFlags = useCallback(async () => {
        try {
            // The user profile data is already loaded in AuthContext
            // We just need to update our local state based on the current user data
            if (user?.chatFeatureEnabled !== undefined) {
                setIsChatFeatureEnabled(user.chatFeatureEnabled);
            }
            if (user?.positionChangesEnabled !== undefined) {
                setIsPositionChangesEnabled(user.positionChangesEnabled);
            }
        } catch (error) {
            console.error('❌ Failed to refresh web feature flags:', error);
        }
    }, [user]);

    const getAllFlags = () => {
        return {
            chat_feature_enabled: isChatFeatureEnabled,
            position_changes_enabled: isPositionChangesEnabled
        };
    };

    // Update feature flags when user changes
    useEffect(() => {
        if (user === null) {
            // User is not logged in
            setIsChatFeatureEnabled(false);
            setIsPositionChangesEnabled(false);
            setIsLoading(false);
        } else if (user) {
            // User is logged in - handle each flag independently
            let flagsSet = 0;

            if (user.chatFeatureEnabled !== undefined) {
                setIsChatFeatureEnabled(user.chatFeatureEnabled);
                flagsSet++;
            }

            if (user.positionChangesEnabled !== undefined) {
                setIsPositionChangesEnabled(user.positionChangesEnabled);
                flagsSet++;
            }

            // If we got at least one flag or user is defined, we can stop loading
            if (flagsSet > 0 || user.id) {
                setIsLoading(false);
            }
        }
        // If user is undefined, we're still loading, so keep isLoading true
    }, [user]);

    const value: FeatureFlagContextType = {
        isChatFeatureEnabled,
        isPositionChangesEnabled,
        isLoading,
        refreshFlags,
        getAllFlags,
    };

    return (
        <FeatureFlagContext.Provider value={value}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

export const useFeatureFlags = (): FeatureFlagContextType => {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
    }
    return context;
};

// Convenience hook for chat feature specifically
export const useChatFeature = () => {
    const { isChatFeatureEnabled, isLoading } = useFeatureFlags();
    return { isChatFeatureEnabled, isLoading };
};

// Convenience hook for position changes feature specifically
export const usePositionChanges = () => {
    const { isPositionChangesEnabled, isLoading } = useFeatureFlags();
    return { isPositionChangesEnabled, isLoading };
};
