import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  Input,
  LoadingOverlay,
  SuccessMessage,
  Badge,
} from '../components';
import LinkrunnerService from '../services/LinkrunnerService';
import { Screen, RootStackParamList, LINKRUNNER_CONFIG } from '../types';

type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  Screen.SETTINGS
>;

/**
 * Settings Screen
 * 
 * Demonstrates:
 * - SDK configuration and initialization
 * - Privacy controls (PII hashing)
 * - Integration with external services
 * - Testing utilities
 * - Deep link handling
 */
export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
  const [projectToken, setProjectToken] = useState(
    LINKRUNNER_CONFIG.PROJECT_TOKEN
  );
  const [secretKey, setSecretKey] = useState(LINKRUNNER_CONFIG.SECRET_KEY);
  const [keyId, setKeyId] = useState(LINKRUNNER_CONFIG.KEY_ID);
  const [deeplinkUrl, setDeeplinkUrl] = useState('');
  const [clevertapId, setClevertapId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [piiHashingEnabled, setPiiHashingEnabled] = useState(false);

  const handleUpdateConfig = async () => {
    try {
      setLoading(true);

      // Reinitialize SDK with new config
      await LinkrunnerService.initialize(
        projectToken,
        secretKey,
        keyId,
        false,
        true
      );

      setSuccessMessage('Configuration updated and SDK reinitialized');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Failed to update configuration: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleHandleDeeplink = async () => {
    try {
      if (!deeplinkUrl.trim()) {
        alert('Please enter a deep link URL');
        return;
      }

      setLoading(true);

      await LinkrunnerService.handleDeepLink(deeplinkUrl);

      setSuccessMessage('Deep link processed');
      setSuccess(true);
      setDeeplinkUrl('');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Error processing deep link: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSetClevertapId = async () => {
    try {
      if (!clevertapId.trim()) {
        alert('Please enter a CleverTap ID');
        return;
      }

      setLoading(true);

      await LinkrunnerService.setIntegrationData(clevertapId);

      setSuccessMessage('CleverTap ID set successfully');
      setSuccess(true);
      setClevertapId('');
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Error setting CleverTap ID: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePIIHashing = () => {
    try {
      LinkrunnerService.enablePIIHashing(!piiHashingEnabled);
      setPiiHashingEnabled(!piiHashingEnabled);

      setSuccessMessage(
        `PII Hashing ${!piiHashingEnabled ? 'enabled' : 'disabled'}`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Error toggling PII hashing: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Processing..." />
      <SuccessMessage visible={success} message={successMessage} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings & Configuration</Text>
          <Text style={styles.subtitle}>
            Manage Linkrunner SDK configuration and integrations
          </Text>
        </View>

        {LINKRUNNER_CONFIG.PROJECT_TOKEN === 'YOUR_PROJECT_TOKEN_HERE' && (
          <Card title="⚠️ Configuration Required">
            <Text style={styles.warningText}>
              Please update your Linkrunner credentials below to get started.
            </Text>
            <Button
              title="Get Your Credentials"
              variant="secondary"
              onPress={() =>
                Linking.openURL(
                  'https://dashboard.linkrunner.io/dashboard?s=members&m=documentation'
                )
              }
            />
          </Card>
        )}

        <Card title="Linkrunner Configuration">
          <Input
            label="Project Token *"
            placeholder="Your project token from dashboard"
            value={projectToken}
            onChangeText={setProjectToken}
          />

          <Input
            label="Secret Key (Optional)"
            placeholder="Your secret key for SDK signing"
            value={secretKey}
            onChangeText={setSecretKey}
          />

          <Input
            label="Key ID (Optional)"
            placeholder="Your key ID for SDK signing"
            value={keyId}
            onChangeText={setKeyId}
          />

          <Text style={styles.hint}>
            These credentials are available at your Linkrunner dashboard:{' '}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL(
                  'https://dashboard.linkrunner.io/dashboard?s=members&m=documentation'
                )
              }
            >
              Open Dashboard
            </Text>
          </Text>

          <Button
            title="Update Configuration & Reinitialize"
            onPress={handleUpdateConfig}
          />
        </Card>

        <Card title="Privacy Controls">
          <View style={styles.privacyOption}>
            <View>
              <Text style={styles.privacyLabel}>PII Hashing</Text>
              <Text style={styles.privacyDescription}>
                Enable SHA-256 hashing of sensitive data (name, email, phone)
              </Text>
            </View>
            <Badge
              text={piiHashingEnabled ? 'Enabled' : 'Disabled'}
              type={piiHashingEnabled ? 'success' : 'info'}
            />
          </View>

          <Button
            title={piiHashingEnabled ? 'Disable PII Hashing' : 'Enable PII Hashing'}
            variant={piiHashingEnabled ? 'danger' : 'primary'}
            onPress={handleTogglePIIHashing}
          />

          <Text style={styles.hint}>
            When enabled, user PII is hashed before sending to Linkrunner servers,
            providing an additional layer of privacy protection.
          </Text>
        </Card>

        <Card title="Deep Link Handler">
          <Input
            label="Deep Link URL"
            placeholder="https://yourapp.com/product/123?campaign=..."
            value={deeplinkUrl}
            onChangeText={setDeeplinkUrl}
          />

          <Text style={styles.hint}>
            Use this to test deep link handling. This would typically be called
            automatically when users click attribution links.
          </Text>

          <Button
            title="Process Deep Link"
            onPress={handleHandleDeeplink}
            disabled={!deeplinkUrl.trim()}
          />
        </Card>

        <Card title="CleverTap Integration">
          <Input
            label="CleverTap User ID"
            placeholder="Your CleverTap user identifier"
            value={clevertapId}
            onChangeText={setClevertapId}
          />

          <Text style={styles.hint}>
            Optional integration with CleverTap for unified user tracking.
          </Text>

          <Button
            title="Set CleverTap ID"
            onPress={handleSetClevertapId}
            disabled={!clevertapId.trim()}
          />
        </Card>

        <Card title="Documentation & Resources">
          <Button
            title="Linkrunner Documentation"
            variant="secondary"
            onPress={() =>
              Linking.openURL('https://docs.linkrunner.io')
            }
          />

          <Button
            title="React Native SDK Guide"
            variant="secondary"
            onPress={() =>
              Linking.openURL('https://docs.linkrunner.io/sdk/react-native')
            }
          />

          <Button
            title="Integration Testing Guide"
            variant="secondary"
            onPress={() =>
              Linking.openURL(
                'https://docs.linkrunner.io/testing/integration-testing'
              )
            }
          />

          <Button
            title="Support Email"
            variant="secondary"
            onPress={() =>
              Linking.openURL('mailto:support@linkrunner.io')
            }
          />
        </Card>

        <Card title="Quick Links">
          <Button
            title="Back to Home"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.HOME)}
          />

          <Button
            title="Go to Signup"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.SIGNUP)}
          />

          <Button
            title="Go to Dashboard"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.DASHBOARD)}
          />

          <Button
            title="Go to Products"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.PRODUCTS)}
          />
        </Card>

        <Card title="💡 Implementation Tips">
          <Text style={styles.tipsText}>
            {`1. Initialize SDK in App.tsx useEffect\n`}
            {`2. Always call signup() when user is identified\n`}
            {`3. Track events after user registration\n`}
            {`4. Use debug mode during development\n`}
            {`5. Test full flow: click → install → signup → event\n`}
            {`6. Handle deep links in app lifecycle\n`}
            {`7. Set up push tokens for uninstall tracking\n`}
            {`8. Verify events in dashboard\n`}
            {`9. Check conversion values for iOS\n`}
            {`10. Enable PII hashing for production`}
          </Text>
        </Card>
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
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
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
    lineHeight: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 12,
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  privacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  privacyDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  tipsText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 20,
  },
});
