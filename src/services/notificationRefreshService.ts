// Service to automatically refresh push notification subscriptions on page load
import { notificationsAPI } from '@/lib/api';

export class NotificationRefreshService {
  private static instance: NotificationRefreshService;
  private isInitialized = false;

  public static getInstance(): NotificationRefreshService {
    if (!NotificationRefreshService.instance) {
      NotificationRefreshService.instance = new NotificationRefreshService();
    }
    return NotificationRefreshService.instance;
  }

  /**
   * Initialize the notification refresh service
   * This should be called when the app loads and user is authenticated
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Check if notifications are supported
      if (!this.isNotificationSupported()) {
        return;
      }

      // Check if user has granted permission
      if (Notification.permission !== 'granted') {
        return;
      }

      // Skip in development mode
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      // Refresh the subscription
      await this.refreshPushSubscription();

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ NotificationRefreshService: Initialization failed:', error);
    }
  }

  /**
   * Check if push notifications are supported
   */
  private isNotificationSupported(): boolean {
    return 'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window;
  }

  /**
   * Refresh the push subscription and register with server
   */
  private async refreshPushSubscription(): Promise<void> {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
      } else {
        console.log('🔄 NotificationRefreshService: Found existing subscription');
      }

      // Register with server
      await notificationsAPI.registerPushToken(
        JSON.stringify(subscription),
        'web'
      );
    } catch (error) {
      console.error('❌ NotificationRefreshService: Failed to refresh subscription:', error);
      throw error;
    }
  }

  /**
   * Check if we have a valid push subscription
   */
  public async hasValidSubscription(): Promise<boolean> {
    try {
      if (!this.isNotificationSupported() || Notification.permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('❌ NotificationRefreshService: Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Get the current push subscription
   */
  public async getCurrentSubscription(): Promise<PushSubscription | null> {
    try {
      if (!this.isNotificationSupported() || Notification.permission !== 'granted') {
        return null;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return null;
      }

      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('❌ NotificationRefreshService: Error getting subscription:', error);
      return null;
    }
  }
}

// Export singleton instance
export const notificationRefreshService = NotificationRefreshService.getInstance();
