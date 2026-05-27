import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  Input,
  LoadingOverlay,
  SuccessMessage,
} from '../components';
import LinkrunnerService from '../services/LinkrunnerService';
import { Screen, RootStackParamList } from '../types';

type DashboardScreenProps = NativeStackScreenProps<
  RootStackParamList,
  Screen.DASHBOARD
>;

/**
 * Dashboard Screen
 * 
 * Demonstrates:
 * - Custom event tracking
 * - Event data with amounts for revenue sharing
 * - Attribution data retrieval
 * - Testing various event types
 * 
 * DEVELOPER EXPERIENCE OBSERVATIONS:
 * - Custom events are simple to track
 * - Can include amounts for ad network optimization
 * - Good practice to log events consistently
 * - Debug mode helps see event firing
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigation,
}) => {
  const [eventName, setEventName] = useState('');
  const [eventData, setEventData] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [attributionData, setAttributionData] = useState<any>(null);

  const handleTrackEvent = async () => {
    try {
      if (!eventName.trim()) {
        alert('Please enter an event name');
        return;
      }

      setLoading(true);

      let parsedData: Record<string, any> = {};
      if (eventData.trim()) {
        try {
          parsedData = JSON.parse(eventData);
        } catch (e) {
          // If not JSON, just send as is
          parsedData = { value: eventData };
        }
      }

      await LinkrunnerService.trackEvent(eventName, parsedData);

      setSuccessMessage(`Event "${eventName}" tracked`);
      setSuccess(true);
      setEventName('');
      setEventData('');
      setTimeout(() => setSuccess(false), 2000);

      console.log('[Dashboard] Event tracked:', eventName, parsedData);
    } catch (err) {
      console.error('[Dashboard] Error tracking event:', err);
      alert('Error tracking event');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAttribution = async () => {
    try {
      setLoading(true);
      const data = await LinkrunnerService.getAttributionData();
      setAttributionData(data);
      setSuccessMessage('Attribution data fetched');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('[Dashboard] Error fetching attribution:', err);
      alert('Error fetching attribution data');
    } finally {
      setLoading(false);
    }
  };

  const quickEventTemplates = [
    { name: 'tutorial_completed', data: { level: 1 } },
    { name: 'level_completed', data: { level: 5, score: 1500 } },
    { name: 'purchase_completed', data: { product_id: 'item_123', amount: 49.99 } },
    { name: 'user_upgraded', data: { plan: 'premium', amount: 99.99 } },
    { name: 'content_shared', data: { content_id: 'article_456', platform: 'facebook' } },
    { name: 'ad_clicked', data: { ad_id: 'ad_789', placement: 'banner' } },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={loading} message="Processing..." />
      <SuccessMessage visible={success} message={successMessage} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Track custom events and view attribution
          </Text>
        </View>

        <Card title="Custom Event Tracker">
          <Input
            label="Event Name *"
            placeholder="e.g., button_clicked, screen_viewed"
            value={eventName}
            onChangeText={setEventName}
            testID="event-name-input"
          />

          <Input
            label="Event Data (JSON)"
            placeholder='{"amount": 99.99, "item_id": "123"}'
            value={eventData}
            onChangeText={setEventData}
            multiline
            testID="event-data-input"
          />

          <Text style={styles.hint}>
            Include an <Text style={styles.code}>amount</Text> field for revenue
            sharing with Google Ads and Meta.
          </Text>

          <Button
            title="Track Event"
            onPress={handleTrackEvent}
            testID="track-event-button"
          />
        </Card>

        <Card title="Quick Event Templates">
          <Text style={styles.hint}>
            Click to quickly test common event patterns:
          </Text>
          {quickEventTemplates.map((template) => (
            <Button
              key={template.name}
              title={template.name}
              variant="secondary"
              onPress={async () => {
                setEventName(template.name);
                setEventData(JSON.stringify(template.data));
                await LinkrunnerService.trackEvent(
                  template.name,
                  template.data
                );
                setSuccessMessage(`Event "${template.name}" tracked`);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 2000);
              }}
            />
          ))}
        </Card>

        <Card title="Attribution Data">
          <Button
            title="Fetch Attribution Data"
            onPress={handleGetAttribution}
            testID="fetch-attribution-button"
          />

          {attributionData && (
            <>
              {attributionData.campaign_data ? (
                <View style={styles.attributionData}>
                  <Text style={styles.dataLabel}>Campaign:</Text>
                  <Text style={styles.dataValue}>
                    {attributionData.campaign_data.name}
                  </Text>

                  <Text style={styles.dataLabel}>Type:</Text>
                  <Text style={styles.dataValue}>
                    {attributionData.campaign_data.type}
                  </Text>

                  <Text style={styles.dataLabel}>Ad Network:</Text>
                  <Text style={styles.dataValue}>
                    {attributionData.campaign_data.ad_network || 'Organic'}
                  </Text>

                  <Text style={styles.dataLabel}>Installed At:</Text>
                  <Text style={styles.dataValue}>
                    {new Date(
                      attributionData.campaign_data.installed_at
                    ).toLocaleString()}
                  </Text>

                  {attributionData.deeplink && (
                    <>
                      <Text style={styles.dataLabel}>Deep Link:</Text>
                      <Text style={styles.dataValue}>
                        {attributionData.deeplink}
                      </Text>
                    </>
                  )}
                </View>
              ) : (
                <Text style={styles.noDataText}>
                  No attribution data available yet. Follow the testing guide to
                  attribute this installation.
                </Text>
              )}
            </>
          )}
        </Card>

        <Card title="Event Testing Checklist">
          <Text style={styles.checklistText}>
            {`✓ Initialize Linkrunner SDK\n`}
            {`✓ Register a user via Signup\n`}
            {`✓ Track custom events\n`}
            {`✓ Track ecommerce events\n`}
            {`✓ Capture revenue/payments\n`}
            {`✓ Verify events in dashboard\n`}
            {`✓ Test deep linking\n`}
            {`✓ Test remarketing flow`}
          </Text>
        </Card>

        <Card title="💡 Developer Notes">
          <Text style={styles.noteText}>
            • Events are only stored for attributed users{'\n'}
            • Include <Text style={styles.code}>amount</Text> for revenue tracking{'\n'}
            • Event names should be descriptive and consistent{'\n'}
            • Use snake_case for event names{'\n'}
            • Check Events Settings page to verify tracking{'\n'}
            • Debug mode logs all event calls to console
          </Text>
        </Card>

        <Card title="Navigation">
          <Button
            title="Go to Home"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.HOME)}
          />
          <Button
            title="Go to Signup"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.SIGNUP)}
          />
          <Button
            title="Go to Products"
            variant="secondary"
            onPress={() => navigation.navigate(Screen.PRODUCTS)}
          />
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
  hint: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    marginBottom: 8,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'Courier',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    color: '#333',
  },
  attributionData: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginTop: 8,
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  checklistText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
