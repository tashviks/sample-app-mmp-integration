import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ErrorBoundary } from './components';
import LinkrunnerService from './services/LinkrunnerService';
import { HomeScreen } from './screens/HomeScreen';
import { SignupScreen } from './screens/SignupScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Screen, RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Main App Component
 * 
 * INTEGRATION ARCHITECTURE:
 * 
 * 1. Navigation Structure
 *    - Uses React Navigation with native stack
 *    - All screens have access to Linkrunner service
 *    - Clear navigation flow through the app
 * 
 * 2. Deep Link Handling
 *    - Cold start: Linking.getInitialURL()
 *    - Warm start: Linking.addEventListener('url')
 *    - Both are processed by LinkrunnerService.handleDeepLink()
 * 
 * 3. Initialization
 *    - SDK initialized on app startup
 *    - Deep links handled at app level
 *    - Error boundary wraps all content
 * 
 * DEVELOPER EXPERIENCE OBSERVATIONS:
 * - Deep link handling at top level is clean
 * - Need to be careful about initialization timing
 * - Deep links should be handled before user navigation
 * - Good practice to log all deep link events
 * - Testing deep links requires proper URL scheme setup
 */
export const App: React.FC = () => {
  useEffect(() => {
    handleDeepLinking();
  }, []);

  /**
   * Handle deep links (both cold and warm starts)
   * This is critical for attribution and remarketing
   */
  const handleDeepLinking = async () => {
    // Handle deep link when app is launched from a deep link
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();

      if (url != null) {
        console.log('[App] Initial deep link URL:', url);
        await LinkrunnerService.handleDeepLink(url);
      }
    };

    // Listen for deep links from other apps while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[App] Deep link received:', url);
      LinkrunnerService.handleDeepLink(url).catch((err) =>
        console.error('[App] Error handling deep link:', err)
      );
    });

    getInitialUrl().catch((err) =>
      console.error('[App] Error getting initial URL:', err)
    );

    return () => {
      subscription.remove();
    };
  };

  const screenOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: '#007AFF',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 18,
    },
    headerBackTitle: 'Back',
  };

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen
            name={Screen.HOME}
            component={HomeScreen}
            options={{
              headerTitle: 'Linkrunner Demo',
              headerShown: false, // Hide header for home screen
            }}
          />
          <Stack.Screen
            name={Screen.SIGNUP}
            component={SignupScreen}
            options={{
              headerTitle: 'Create Account',
            }}
          />
          <Stack.Screen
            name={Screen.DASHBOARD}
            component={DashboardScreen}
            options={{
              headerTitle: 'Dashboard',
            }}
          />
          <Stack.Screen
            name={Screen.PRODUCTS}
            component={ProductsScreen}
            options={{
              headerTitle: 'Products & Ecommerce',
            }}
          />
          <Stack.Screen
            name={Screen.SETTINGS}
            component={SettingsScreen}
            options={{
              headerTitle: 'Settings',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
};

export default App;
