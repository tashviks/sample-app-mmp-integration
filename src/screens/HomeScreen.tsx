import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Badge, LoadingOverlay } from '../components';
import LinkrunnerService from '../services/LinkrunnerService';
import { Screen, RootStackParamList } from '../types';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, Screen.HOME>;

/**
 * Home Screen
 * 
 * Demonstrates:
 * - SDK initialization
 * - Attribution data retrieval
 * - Getting app started
 * 
 * DEVELOPER EXPERIENCE OBSERVATIONS:
 * - SDK initialization is straightforward but requires credentials
 * - Attribution data takes a moment to populate after init
 * - Good UX to show loading state during initialization
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attributionData, setAttributionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeLinkrunner();
  }, []);

  const initializeLinkrunner = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize SDK with your project credentials
      // IMPORTANT: Replace with actual credentials from dashboard
      await LinkrunnerService.initialize(
        'YOUR_PROJECT_TOKEN_HERE',
        'YOUR_SECRET_KEY_HERE', // Optional
        'YOUR_KEY_ID_HERE', // Optional
        false, // disableIDFA (iOS)
        true // debugMode
      );

      setIsInitialized(true);

      // Fetch attribution data after init
      const attribution = await LinkrunnerService.getAttributionData();
      setAttributionData(attribution);

      console.log('[HomeScreen] Linkrunner initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Initialization failed: ${errorMessage}`);
      console.error('[HomeScreen] Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Initializing Linkrunner..." />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Linkrunner Demo App</Text>
          <Text style={styles.subtitle}>Complete SDK Integration Reference</Text>
        </View>

        {error && (
          <Card title="⚠️ Configuration Required">
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.configHint}>
              Please update your Linkrunner credentials in {'\n'}
              <Text style={styles.code}>src/types/index.ts</Text>
            </Text>
          </Card>
        )}

        {isInitialized && (
          <>
            <Card title="✅ SDK Status">
              <Badge text="Linkrunner Initialized" type="success" />
              <Text style={styles.statusText}>
                The SDK is ready to track user interactions, events, and revenue.
              </Text>
            </Card>

            {attributionData && (
              <Card title="📊 Attribution Data">
                {attributionData.campaign_data ? (
                  <>
                    <Text style={styles.infoLabel}>Campaign:</Text>
                    <Text style={styles.infoValue}>
                      {attributionData.campaign_data.name}
                    </Text>
                    <Text style={styles.infoLabel}>Ad Network:</Text>
                    <Text style={styles.infoValue}>
                      {attributionData.campaign_data.ad_network || 'Organic'}
                    </Text>
                    <Text style={styles.infoLabel}>Type:</Text>
                    <Text style={styles.infoValue}>
                      {attributionData.campaign_data.type}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.noDataText}>
                    No attribution data yet.{'\n'}
                    Follow the testing guide to attribute this user.
                  </Text>
                )}
              </Card>
            )}

            <Card title="🎯 Quick Actions">
              <Button
                title="Create User Account"
                onPress={() => navigation.navigate(Screen.SIGNUP)}
              />
              <Button
                title="View Dashboard"
                onPress={() => navigation.navigate(Screen.DASHBOARD)}
              />
              <Button
                title="Browse Products"
                onPress={() => navigation.navigate(Screen.PRODUCTS)}
              />
            </Card>

            <Card title="📚 Documentation">
              <Button
                title="View Linkrunner Docs"
                variant="secondary"
                onPress={() =>
                  Linking.openURL('https://docs.linkrunner.io')
                }
              />
              <Button
                title="Integration Testing Guide"
                variant="secondary"
                onPress={() =>
                  Linking.openURL('https://docs.linkrunner.io/testing/integration-testing')
                }
              />
            </Card>

            <Card title="⚙️ Configuration">
              <Text style={styles.configText}>
                {`PROJECT_TOKEN: YOUR_PROJECT_TOKEN_HERE\n`}
                {`SECRET_KEY: YOUR_SECRET_KEY_HERE\n`}
                {`KEY_ID: YOUR_KEY_ID_HERE`}
              </Text>
              <Button
                title="View Settings"
                variant="secondary"
                onPress={() => navigation.navigate(Screen.SETTINGS)}
              />
            </Card>
          </>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 8,
  },
  configHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  configText: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  spacer: {
    height: 24,
  },
});
