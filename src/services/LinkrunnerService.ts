import linkrunner from 'rn-linkrunner';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

/**
 * LinkrunnerService
 * Comprehensive service layer for all Linkrunner SDK operations
 * 
 * This service demonstrates:
 * - SDK initialization with all parameters
 * - User identification and data tracking
 * - Event tracking (custom events, ecommerce, revenue)
 * - Deep linking
 * - Push notification token management
 * - Attribution data retrieval
 * - PII hashing and privacy controls
 */

interface UserData {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  user_created_at?: string;
  is_first_time_user?: boolean;
  mixpanel_distinct_id?: string;
  amplitude_device_id?: string;
  posthog_distinct_id?: string;
}

interface PaymentData {
  amount: number;
  userId: string;
  paymentId?: string;
  type?: 'FIRST_PAYMENT' | 'SECOND_PAYMENT' | 'WALLET_TOPUP' | 'FUNDS_WITHDRAWAL' | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_RENEWED' | 'ONE_TIME' | 'RECURRING' | 'DEFAULT';
  status?: 'PAYMENT_INITIATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELLED';
  eventData?: Record<string, any>;
}

interface EcommerceEventData {
  content_ids: string[];
  contents: Array<{
    id: string;
    quantity: number;
    item_price: number;
  }>;
  content_type: string;
  currency: string;
  value: number;
  num_items?: number;
  order_id?: string;
}

interface AttributionData {
  deeplink: string | null;
  campaign_data?: {
    id: string;
    name: string;
    type: string;
    ad_network: string | null;
    installed_at: string;
    store_click_at: string | null;
    group_name: string;
    asset_name: string;
    asset_group_name: string;
  };
  attribution_source: string;
}

class LinkrunnerService {
  private initialized = false;
  private attributionData: AttributionData | null = null;

  /**
   * Initialize Linkrunner SDK
   * 
   * DEVELOPER EXPERIENCE NOTE:
   * - The init() method is async and should be called in useEffect on app startup
   * - Debug mode helpful during integration but should be disabled in production
   * - SDK signing is optional but recommended for security
   */
  async initialize(
    projectToken: string,
    secretKey?: string,
    keyId?: string,
    disableIDFA: boolean = false,
    debugMode: boolean = true
  ): Promise<void> {
    try {
      await linkrunner.init(
        projectToken,
        secretKey,
        keyId,
        disableIDFA,
        debugMode
      );
      this.initialized = true;
      console.log('[Linkrunner] SDK initialized successfully');
      
      // Fetch initial attribution data
      await this.getAttributionData();
      
      // Setup push token if on Android
      if (Platform.OS === 'android') {
        await this.setupFCMToken();
      } else {
        await this.setupAPNsToken();
      }
    } catch (error) {
      console.error('[Linkrunner] Initialization error:', error);
      throw error;
    }
  }

  /**
   * User Signup / Identification
   * CRITICAL: Call this as soon as user identity is available
   * This ties the install to the user and enables event tracking
   */
  async registerUser(userData: UserData): Promise<void> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      await linkrunner.signup({
        user_data: {
          id: userData.id,
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          user_created_at: userData.user_created_at,
          is_first_time_user: userData.is_first_time_user,
          mixpanel_distinct_id: userData.mixpanel_distinct_id,
          amplitude_device_id: userData.amplitude_device_id,
          posthog_distinct_id: userData.posthog_distinct_id,
        },
        data: {},
      });
      console.log('[Linkrunner] User registered:', userData.id);
    } catch (error) {
      console.error('[Linkrunner] Error registering user:', error);
      throw error;
    }
  }

  /**
   * Update user data
   * Use this when additional user details become available after signup
   * NOT a replacement for signup - call signup first
   */
  async updateUserData(userData: UserData): Promise<void> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      await linkrunner.setUserData({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        mixpanel_distinct_id: userData.mixpanel_distinct_id,
        amplitude_device_id: userData.amplitude_device_id,
        posthog_distinct_id: userData.posthog_distinct_id,
      });
      console.log('[Linkrunner] User data updated');
    } catch (error) {
      console.error('[Linkrunner] Error updating user data:', error);
      throw error;
    }
  }

  /**
   * Set additional integration data (e.g., CleverTap ID)
   */
  async setIntegrationData(clevertapId?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      await linkrunner.setAdditionalData({
        clevertapId,
      });
      console.log('[Linkrunner] Integration data set');
    } catch (error) {
      console.error('[Linkrunner] Error setting integration data:', error);
      throw error;
    }
  }

  /**
   * Get current attribution data
   * Returns campaign details and deep link information
   */
  async getAttributionData(): Promise<AttributionData | null> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      const data = await linkrunner.getAttributionData();
      this.attributionData = data;
      console.log('[Linkrunner] Attribution data retrieved:', data);
      return data;
    } catch (error) {
      console.error('[Linkrunner] Error getting attribution data:', error);
      return null;
    }
  }

  /**
   * Handle deep links (both cold and warm starts)
   * IMPORTANT: This is essential for remarketing and reattribution
   */
  async handleDeepLink(url: string): Promise<void> {
    if (!this.initialized) {
      console.warn('[Linkrunner] SDK not initialized, queuing deep link');
      return;
    }

    try {
      const result = await linkrunner.handleDeeplink(url);
      console.log('[Linkrunner] Deep link handled:', result);
      
      if (result?.deeplink) {
        // Resolve the tracking URL to the actual deep link destination
        console.log('[Linkrunner] Resolved deep link:', result.deeplink);
      }
    } catch (error) {
      console.error('[Linkrunner] Error handling deep link:', error);
      throw error;
    }
  }

  /**
   * Track custom events
   * Events are only stored for attributed users
   * Include 'amount' for revenue sharing with ad networks
   */
  async trackEvent(
    eventName: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      await linkrunner.trackEvent(eventName, eventData);
      console.log('[Linkrunner] Event tracked:', eventName, eventData);
    } catch (error) {
      console.error('[Linkrunner] Error tracking event:', error);
      throw error;
    }
  }

  /**
   * Track ecommerce "Add to Cart" event
   * Properly formatted for Meta catalog sync
   */
  async trackAddToCart(
    productId: string,
    productName: string,
    price: number,
    currency: string = 'USD'
  ): Promise<void> {
    try {
      const eventData: EcommerceEventData = {
        content_ids: [productId],
        contents: [
          {
            id: productId,
            quantity: 1,
            item_price: price,
          },
        ],
        content_type: 'product',
        currency,
        value: price,
        num_items: 1,
      };

      await this.trackEvent('add_to_cart', eventData);
      console.log('[Linkrunner] Add to cart tracked:', productId);
    } catch (error) {
      console.error('[Linkrunner] Error tracking add to cart:', error);
      throw error;
    }
  }

  /**
   * Track ecommerce "View Content" event
   */
  async trackViewContent(
    productId: string,
    productName: string,
    price: number,
    currency: string = 'USD'
  ): Promise<void> {
    try {
      const eventData: EcommerceEventData = {
        content_ids: [productId],
        contents: [
          {
            id: productId,
            quantity: 1,
            item_price: price,
          },
        ],
        content_type: 'product',
        currency,
        value: price,
        num_items: 1,
      };

      await this.trackEvent('view_item', eventData);
      console.log('[Linkrunner] View content tracked:', productId);
    } catch (error) {
      console.error('[Linkrunner] Error tracking view content:', error);
      throw error;
    }
  }

  /**
   * Capture payment / revenue
   * CRITICAL: User must be registered via signup() before tracking revenue
   * Supports first payment, subscriptions, wallet topup, etc.
   */
  async capturePayment(paymentData: PaymentData): Promise<void> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      await linkrunner.capturePayment({
        amount: paymentData.amount,
        userId: paymentData.userId,
        paymentId: paymentData.paymentId,
        type: paymentData.type || 'DEFAULT',
        status: paymentData.status || 'PAYMENT_COMPLETED',
        eventData: paymentData.eventData,
      });
      console.log('[Linkrunner] Payment captured:', paymentData.paymentId);
    } catch (error) {
      console.error('[Linkrunner] Error capturing payment:', error);
      throw error;
    }
  }

  /**
   * Capture ecommerce purchase
   * Properly formatted for Meta catalog sync and revenue tracking
   */
  async capturePurchase(
    orderId: string,
    userId: string,
    items: Array<{ id: string; name: string; price: number; quantity: number }>,
    totalValue: number,
    currency: string = 'USD'
  ): Promise<void> {
    try {
      const eventData: EcommerceEventData & { order_id: string } = {
        content_ids: items.map(i => i.id),
        contents: items.map(i => ({
          id: i.id,
          quantity: i.quantity,
          item_price: i.price,
        })),
        content_type: 'product',
        currency,
        value: totalValue,
        num_items: items.length,
        order_id: orderId,
      };

      await this.capturePayment({
        amount: totalValue,
        userId,
        paymentId: orderId,
        type: 'FIRST_PAYMENT',
        status: 'PAYMENT_COMPLETED',
        eventData,
      });
      console.log('[Linkrunner] Purchase captured:', orderId);
    } catch (error) {
      console.error('[Linkrunner] Error capturing purchase:', error);
      throw error;
    }
  }

  /**
   * Remove payment (for refunds or cancellations)
   */
  async removePayment(userId: string, paymentId?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Linkrunner SDK not initialized');
    }

    try {
      await linkrunner.removePayment({
        userId,
        paymentId,
      });
      console.log('[Linkrunner] Payment removed:', paymentId || userId);
    } catch (error) {
      console.error('[Linkrunner] Error removing payment:', error);
      throw error;
    }
  }

  /**
   * Enable PII hashing for enhanced privacy
   * Hashes name, email, phone using SHA-256
   */
  enablePIIHashing(enabled: boolean): void {
    try {
      linkrunner.enablePIIHashing(enabled);
      console.log('[Linkrunner] PII hashing:', enabled ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('[Linkrunner] Error setting PII hashing:', error);
      throw error;
    }
  }

  /**
   * Setup FCM token for uninstall tracking (Android)
   */
  private async setupFCMToken(): Promise<void> {
    try {
      const token = await messaging().getToken();
      if (token) {
        await linkrunner.setPushToken(token);
        console.log('[Linkrunner] FCM token set for uninstall tracking');
      }

      // Listen for token refresh
      messaging().onTokenRefresh(async (token) => {
        await linkrunner.setPushToken(token);
        console.log('[Linkrunner] FCM token refreshed');
      });

      // Handle incoming messages
      messaging().onMessage(async (remoteMessage) => {
        if (remoteMessage.data?.['lr-uninstall-tracking']) {
          // Silent notification for uninstall tracking, ignore
          console.log('[Linkrunner] Uninstall tracking notification received');
          return;
        }
        // Handle other messages here
        console.log('[Linkrunner] FCM message received:', remoteMessage);
      });
    } catch (error) {
      console.error('[Linkrunner] Error setting up FCM token:', error);
    }
  }

  /**
   * Setup APNs token for uninstall tracking (iOS)
   */
  private async setupAPNsToken(): Promise<void> {
    try {
      const apnsToken = await messaging().getAPNSToken();
      if (apnsToken) {
        await linkrunner.setPushToken(apnsToken);
        console.log('[Linkrunner] APNs token set for uninstall tracking');
      }
    } catch (error) {
      console.error('[Linkrunner] Error setting up APNs token:', error);
    }
  }

  /**
   * Get current cached attribution data
   */
  getCachedAttributionData(): AttributionData | null {
    return this.attributionData;
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export default new LinkrunnerService();
export type { UserData, PaymentData, EcommerceEventData, AttributionData };
