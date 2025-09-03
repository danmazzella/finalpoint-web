import { remoteConfig } from '../lib/firebase';
import { fetchAndActivate, getValue } from 'firebase/remote-config';

/**
 * Feature Flag Service for Web App
 * Manages feature flags using Firebase Remote Config
 */
export class FeatureFlagService {
    private static instance: FeatureFlagService;
    private initialized = false;
    private lastFetchTime = 0;
    private readonly FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

    private constructor() { }

    public static getInstance(): FeatureFlagService {
        if (!FeatureFlagService.instance) {
            FeatureFlagService.instance = new FeatureFlagService();
        }
        return FeatureFlagService.instance;
    }

    /**
     * Initialize the feature flag service
     */
    public async initialize(): Promise<void> {
        if (this.initialized || !remoteConfig) {
            return;
        }

        try {
            // Fetch and activate remote config values
            await fetchAndActivate(remoteConfig);
            this.initialized = true;
            this.lastFetchTime = Date.now();
            console.log('✅ Web feature flags initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize web feature flags:', error);
            // Continue with default values
            this.initialized = true;
        }
    }

    /**
     * Fetch fresh feature flag values from Firebase
     */
    public async fetchFreshValues(): Promise<void> {
        if (!remoteConfig || !this.initialized) {
            await this.initialize();
            return;
        }

        try {
            await fetchAndActivate(remoteConfig);
            this.lastFetchTime = Date.now();
            console.log('✅ Web feature flags refreshed');
        } catch (error) {
            console.error('❌ Failed to refresh web feature flags:', error);
        }
    }

    /**
     * Get a feature flag value
     */
    public getFlagValue(flagName: string, defaultValue: any = false): any {
        if (!remoteConfig || !this.initialized) {
            return defaultValue;
        }

        try {
            const value = getValue(remoteConfig, flagName);
            return value.asString();
        } catch (error) {
            console.error(`❌ Failed to get web feature flag ${flagName}:`, error);
            return defaultValue;
        }
    }

    /**
     * Check if a feature is enabled
     */
    public isFeatureEnabled(flagName: string, defaultValue: boolean = false): boolean {
        const value = this.getFlagValue(flagName, defaultValue);
        return Boolean(value);
    }

    /**
     * Check if chat feature is enabled for a specific user
     */
    public isChatFeatureEnabled(userId?: string): boolean {
        // First check if the feature is globally enabled
        const globallyEnabled = this.isFeatureEnabled('chat_feature_enabled', false);

        if (!globallyEnabled) {
            return false;
        }

        // If no user ID provided, return the global setting
        if (!userId) {
            return globallyEnabled;
        }

        // Check if user is in the whitelist
        const whitelist = this.getFlagValue('chat_feature_user_whitelist', '');
        if (!whitelist) {
            return globallyEnabled;
        }

        // Parse the whitelist (comma-separated user IDs or emails)
        const whitelistedUsers = whitelist.split(',').map((id: string) => id.trim().toLowerCase());
        const userIdentifier = userId.toLowerCase();

        return whitelistedUsers.includes(userIdentifier);
    }

    /**
     * Check if we should fetch fresh values (based on time interval)
     */
    public shouldFetchFreshValues(): boolean {
        return Date.now() - this.lastFetchTime > this.FETCH_INTERVAL;
    }

    /**
     * Get all feature flags (for debugging)
     */
    public getAllFlags(): Record<string, any> {
        if (!remoteConfig || !this.initialized) {
            return {};
        }

        try {
            const flags: Record<string, any> = {};
            const keys = Object.keys(remoteConfig.defaultConfig);

            keys.forEach(key => {
                flags[key] = this.getFlagValue(key);
            });

            return flags;
        } catch (error) {
            console.error('❌ Failed to get all web feature flags:', error);
            return {};
        }
    }
}

// Export singleton instance
export const featureFlagService = FeatureFlagService.getInstance();
