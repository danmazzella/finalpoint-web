'use client';

import React from 'react';
import AppleSigninButton from 'react-apple-signin-auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { appleConfig, isAppleSignInAvailable } from '@/lib/apple-config';

interface AppleSignInButtonProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({ onSuccess, onError }) => {
    const { loginWithApple } = useAuth();
    const { showToast } = useToast();

    const handleAppleSignIn = async (response: { authorization?: { id_token: string } }) => {
        try {
            if (response.authorization) {
                const result = await loginWithApple(response.authorization.id_token);

                if (result.success) {
                    showToast('Successfully signed in with Apple!', 'success');
                    onSuccess?.();
                } else {
                    const errorMsg = result.error || 'Apple Sign-In failed';
                    showToast(errorMsg, 'error');
                    onError?.(errorMsg);
                }
            }
        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Apple Sign-In failed';
            showToast(errorMsg, 'error');
            onError?.(errorMsg);
        }
    };

    const handleError = (error: unknown) => {
        console.error('Apple Sign-In error:', error);
        const errorMsg = 'Apple Sign-In failed';
        showToast(errorMsg, 'error');
        onError?.(errorMsg);
    };

    // Don't render if Apple Sign-In is not available
    if (!isAppleSignInAvailable()) {
        return null;
    }

    return (
        <AppleSigninButton
            uiType="dark"
            authOptions={{
                clientId: appleConfig.clientId,
                scope: appleConfig.scope,
                redirectURI: appleConfig.redirectURI,
                state: appleConfig.state,
                usePopup: appleConfig.usePopup,
            }}
            onSuccess={handleAppleSignIn}
            onError={handleError}
        />
    );
};

export default AppleSignInButton;
