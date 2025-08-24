/**
 * Utility functions for clipboard operations with fallbacks for different browsers and environments
 */

/**
 * Copies text to clipboard with fallback support
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        // Fallback for older browsers or non-secure contexts
        return fallbackCopyToClipboard(text);
    } catch (error) {
        console.warn('Modern clipboard API failed, trying fallback:', error);
        return fallbackCopyToClipboard(text);
    }
};

/**
 * Fallback clipboard method using document.execCommand
 * @param text - Text to copy to clipboard
 * @returns boolean indicating success
 */
const fallbackCopyToClipboard = (text: string): boolean => {
    try {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Make it invisible
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);

        // Focus and select the text
        textArea.focus();
        textArea.select();

        // Try to copy
        const successful = document.execCommand('copy');

        // Clean up
        document.body.removeChild(textArea);

        return successful;
    } catch (error) {
        console.error('Fallback clipboard method failed:', error);
        return false;
    }
};

/**
 * Copies text to clipboard and shows appropriate feedback
 * @param text - Text to copy
 * @param showToast - Function to show toast notification
 * @param successMessage - Success message to show
 * @param errorMessage - Error message to show
 */
export const copyToClipboardWithFeedback = async (
    text: string,
    showToast: (message: string, type: 'success' | 'error') => void,
    successMessage: string = 'Copied to clipboard!',
    errorMessage: string = 'Failed to copy to clipboard'
): Promise<void> => {
    const success = await copyToClipboard(text);

    if (success) {
        showToast(successMessage, 'success');
    } else {
        showToast(errorMessage, 'error');
    }
};

/**
 * Checks if clipboard API is available
 * @returns boolean indicating if clipboard API is supported
 */
export const isClipboardSupported = (): boolean => {
    return !!(navigator.clipboard && window.isSecureContext);
};

/**
 * Gets clipboard support information for debugging
 * @returns object with clipboard support details
 */
export const getClipboardSupportInfo = () => {
    return {
        hasClipboardAPI: !!navigator.clipboard,
        isSecureContext: window.isSecureContext,
        userAgent: navigator.userAgent,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port
    };
};
