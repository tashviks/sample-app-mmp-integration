import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  Input,
  LoadingOverlay,
  SuccessMessage,
} from '../components';
import LinkrunnerService, { UserData } from '../services/LinkrunnerService';
import { Screen, RootStackParamList } from '../types';

type SignupScreenProps = NativeStackScreenProps<
  RootStackParamList,
  Screen.SIGNUP
>;

/**
 * Signup Screen
 * 
 * Demonstrates:
 * - User registration with Linkrunner SDK
 * - Passing user data to SDK
 * - Handling optional fields (email, phone, name)
 * - Integration with analytics platforms (Mixpanel, Amplitude, PostHog)
 * 
 * DEVELOPER EXPERIENCE OBSERVATIONS:
 * - signup() is straightforward and works well
 * - Good practice to call this as soon as user identity is available
 * - Optional fields are flexible but recommended for better attribution
 * - Analytics platform IDs are optional but useful for multi-platform tracking
 */
export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    mixpanelId: '',
    amplitudeId: '',
    posthogId: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      setError(null);

      // Validate required field
      if (!formData.userId.trim()) {
        setError('User ID is required');
        return;
      }

      setLoading(true);

      const userData: UserData = {
        id: formData.userId,
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        mixpanel_distinct_id: formData.mixpanelId || undefined,
        amplitude_device_id: formData.amplitudeId || undefined,
        posthog_distinct_id: formData.posthogId || undefined,
        user_created_at: new Date().toISOString(),
        is_first_time_user: true,
      };

      await LinkrunnerService.registerUser(userData);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigation.navigate(Screen.DASHBOARD);
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      console.error('[SignupScreen] Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserData = async () => {
    try {
      setError(null);

      if (!formData.userId.trim()) {
        setError('User ID is required');
        return;
      }

      setLoading(true);

      const userData: UserData = {
        id: formData.userId,
        name: formData.name || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        mixpanel_distinct_id: formData.mixpanelId || undefined,
        amplitude_device_id: formData.amplitudeId || undefined,
        posthog_distinct_id: formData.posthogId || undefined,
      };

      await LinkrunnerService.updateUserData(userData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      console.error('[SignupScreen] Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Processing..." />
      <SuccessMessage visible={success} message="User registered successfully!" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register your user with Linkrunner for full attribution
          </Text>
        </View>

        {error && (
          <Card title="Error">
            <Text style={styles.errorText}>{error}</Text>
          </Card>
        )}

        <Card title="Required Information">
          <Input
            label="User ID *"
            placeholder="e.g., user_123 or email@example.com"
            value={formData.userId}
            onChangeText={(text) =>
              setFormData({ ...formData, userId: text })
            }
            testID="userId-input"
          />

          <Text style={styles.hint}>
            This should be a unique identifier for the user. Typically their account ID
            or email address.
          </Text>
        </Card>

        <Card title="User Details (Optional)">
          <Input
            label="Name"
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(text) =>
              setFormData({ ...formData, name: text })
            }
          />

          <Input
            label="Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(text) =>
              setFormData({ ...formData, email: text })
            }
          />

          <Input
            label="Phone"
            placeholder="+1234567890"
            value={formData.phone}
            onChangeText={(text) =>
              setFormData({ ...formData, phone: text })
            }
          />
        </Card>

        <Card title="Analytics Integration (Optional)">
          <Text style={styles.integrationHint}>
            If you're using Mixpanel, Amplitude, or PostHog, provide their user
            identifiers for unified tracking:
          </Text>

          <Input
            label="Mixpanel Distinct ID"
            placeholder="mixpanel_user_id"
            value={formData.mixpanelId}
            onChangeText={(text) =>
              setFormData({ ...formData, mixpanelId: text })
            }
          />

          <Input
            label="Amplitude Device ID"
            placeholder="amplitude_device_id"
            value={formData.amplitudeId}
            onChangeText={(text) =>
              setFormData({ ...formData, amplitudeId: text })
            }
          />

          <Input
            label="PostHog Distinct ID"
            placeholder="posthog_distinct_id"
            value={formData.posthogId}
            onChangeText={(text) =>
              setFormData({ ...formData, posthogId: text })
            }
          />

          <Text style={styles.integrationHint}>
            These fields are optional but recommended for complete multi-platform tracking.
          </Text>
        </Card>

        <Card title="Actions">
          <Button
            title="Register User"
            onPress={handleSignup}
            loading={loading}
            testID="signup-button"
          />

          <Button
            title="Update User Data"
            variant="secondary"
            onPress={handleUpdateUserData}
            loading={loading}
            testID="update-button"
          />

          <Button
            title="Back to Home"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </Card>

        <Card title="💡 Developer Notes">
          <Text style={styles.noteText}>
            • Call <Text style={styles.code}>signup()</Text> as soon as user
            identity is available{'\n'}
            • Use <Text style={styles.code}>setUserData()</Text> for updates after
            signup{'\n'}
            • User ID is required, others are optional{'\n'}
            • Analytics IDs enable cross-platform tracking{'\n'}
            • Linkrunner stores encrypted user data locally
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
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  integrationHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    color: '#333',
  },
});
