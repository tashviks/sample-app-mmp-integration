/**
 * Global type definitions and constants
 */

import type { ParamListBase } from '@react-navigation/native';

// Replace these with your actual Linkrunner credentials
// Available at: https://dashboard.linkrunner.io/dashboard?s=members&m=documentation
export const LINKRUNNER_CONFIG = {
  PROJECT_TOKEN: 'YOUR_PROJECT_TOKEN_HERE',
  SECRET_KEY: 'YOUR_SECRET_KEY_HERE', // Optional but recommended
  KEY_ID: 'YOUR_KEY_ID_HERE', // Optional but recommended
  DEBUG_MODE: true, // Set to false in production
};

export enum Screen {
  HOME = 'Home',
  SIGNUP = 'Signup',
  DASHBOARD = 'Dashboard',
  PRODUCTS = 'Products',
  SETTINGS = 'Settings',
}

export interface RootStackParamList extends ParamListBase {
  [Screen.HOME]: undefined;
  [Screen.SIGNUP]: undefined;
  [Screen.DASHBOARD]: undefined;
  [Screen.PRODUCTS]: undefined;
  [Screen.SETTINGS]: undefined;
}

export enum EventType {
  // Standard events
  SIGNUP = 'signup_completed',
  LOGIN = 'login_completed',
  PURCHASE = 'purchase_completed',
  ADD_TO_CART = 'add_to_cart',
  VIEW_ITEM = 'view_item',
  SEARCH = 'search_initiated',
  
  // Ecommerce events
  VIEW_CONTENT = 'view_content',
  ADD_CART = 'add_to_cart',
  
  // Other
  TUTORIAL_COMPLETED = 'tutorial_completed',
  LEVEL_COMPLETED = 'level_completed',
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void>;
}
