# Linkrunner SDK Testing Guide

## Overview

This guide walks through testing the complete Linkrunner integration using the demo app. This follows the official Linkrunner [Integration Testing Guide](https://docs.linkrunner.io/testing/integration-testing).

## Prerequisites

### 1. Linkrunner Account
- Dashboard access: https://dashboard.linkrunner.io
- Project created and configured
- Domain setup completed

### 2. Credentials
Get from Dashboard > Settings > SDK Signing:
- Project Token
- Secret Key (optional but recommended)
- Key ID (optional but recommended)

### 3. Test Device
- Physical device OR simulator/emulator
- App completely uninstalled before each test
- Linkrunner SDK integrated (this demo app)
- Debug mode enabled

### 4. Environment Setup
- Latest version of React Native
- Development build for native access
- For iOS: Xcode and pods installed
- For Android: Android Studio/SDK installed

## Test Flow: Click → Install → Signup → Event

### Phase 1: SDK Initialization (5 minutes)

**Goal**: Verify SDK initializes and connects to Linkrunner backend

**Steps**:
1. Update `src/types/index.ts` with your credentials:
   ```typescript
   export const LINKRUNNER_CONFIG = {
     PROJECT_TOKEN: 'YOUR_ACTUAL_TOKEN',
     SECRET_KEY: 'YOUR_ACTUAL_SECRET',
     KEY_ID: 'YOUR_ACTUAL_KEY_ID',
     DEBUG_MODE: true,
   };
   ```

2. Build and run app:
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

3. Open Home screen
4. Look for these signs of success:
   - ✅ "Linkrunner Initialized" badge appears
   - ✅ No error message in red
   - ✅ Console shows: `[Linkrunner] SDK initialized successfully`

**Troubleshooting**:
- If initialization fails:
  - Check credentials in console
  - Verify network connectivity
  - Check Dashboard > Settings > SDK Signing for credentials
  - Enable debug mode to see detailed logs

---

### Phase 2: Campaign Click Test (5 minutes)

**Goal**: Verify Linkrunner tracks the initial click

**Steps**:

1. Go to Dashboard > Campaigns
2. Click "Create Campaign"
3. Fill in campaign details:
   - Name: "Test Click" + timestamp
   - Link to app: Select your app
   - Other fields: Leave as defaults
4. Click "Create" and copy the generated link

5. On your test device browser:
   - Open the campaign link
   - Should see redirect/loading briefly
   - Browser may try to open app (OK if it fails, app not installed yet)

6. Back in Linkrunner Dashboard:
   - Refresh campaign
   - ✅ Click count should be **1**

**Expected Results**:
- Click recorded in Dashboard
- No errors in app
- Console shows: `[App] Deep link received`

**Troubleshooting**:
- Click count not increasing?
  - Confirm you opened link ON THE TEST DEVICE (not simulator from computer)
  - Check domain setup in Dashboard > Settings > Domains
  - For Universal Links/App Links, verify deep link configuration

---

### Phase 3: Install & Attribution Test (5 minutes)

**Goal**: Verify app install is attributed to campaign click

**Steps**:

1. **Make sure the app is completely uninstalled** from test device

2. Open the campaign link on your test device (from Phase 2)

3. Within 3 minutes, build and install the app:
   ```bash
   # iOS
   npm run ios
   
   # Android  
   npm run android
   ```

4. Allow 5-10 seconds for app to fully start

5. On Home screen, check for:
   - ✅ Attribution data showing campaign name
   - ✅ "Linkrunner Initialized" badge
   - ✅ Campaign details like "Type: INORGANIC"

6. In Linkrunner Dashboard:
   - Refresh campaign
   - ✅ Install count should be **1**

**Expected Results**:
- Install attributed to the campaign
- Campaign shows: Clicks: 1, Installs: 1
- App displays attribution details
- Deep link data (if applicable) shown in app

**Key Timing Rule**: Must open app within 3 minutes of clicking link

**Alternative Flow** (if building takes > 3 minutes):
1. First install the app completely
2. Then open campaign link in browser
3. Immediately open the app after clicking
4. Attribution should still work

**Troubleshooting**:
- Install count not increasing?
  - Confirm app was fully uninstalled before test
  - Check that 3-minute window was met
  - Verify deep link handling is working (see deep linking section)
  - Check console for initialization errors
  - May need to disable IDFA on iOS or rebuild

---

### Phase 4: User Signup Test (5 minutes)

**Goal**: Verify user registration ties install to user identity

**Steps**:

1. From Home screen, click "Create User Account"

2. Fill in signup form:
   - **User ID**: Enter unique ID (required)
     - Good examples:
       - `test_user_123`
       - Your email: `your.email@example.com`
       - `lr_test_` + timestamp
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "1234567890"
   - Leave analytics IDs empty for now

3. Click "Register User"

4. Should see: "User registered successfully!"

5. In Linkrunner Dashboard:
   - Go to Campaigns > your test campaign
   - ✅ Signup count should be **1**
   - Click on campaign to see user details

**Expected Results**:
- Signup event recorded
- User ID captured
- Campaign shows Clicks: 1, Installs: 1, Signups: 1
- User data visible in dashboard

**Why This Matters**:
- Signup is the critical event that ties everything together
- Without signup, revenue and custom events aren't tracked
- Always call `signup()` as soon as user identity is available

**Troubleshooting**:
- Signup count not increasing?
  - Make sure user ID is provided (required)
  - Check console for errors
  - Verify user was actually attributed to campaign first
  - Try with a different user ID

---

### Phase 5: Custom Event Test (5 minutes)

**Goal**: Verify custom event tracking works

**Steps**:

1. From Home screen, go to Dashboard screen (or Settings → Dashboard)

2. **Test Quick Event Templates**:
   - Click any quick template button (e.g., "tutorial_completed")
   - Should see: "Event [name] tracked"
   - Check console for confirmation

3. **Test Custom Event**:
   - Event Name: `test_event`
   - Event Data: `{"test_value": 123}`
   - Click "Track Event"
   - Should see success message

4. In Linkrunner Dashboard:
   - Go to Events Settings page
   - ✅ Your events should appear in the list

**Important**: Events only show for attributed users!

**Expected Results**:
- Events appear in Dashboard Events Settings
- Console shows event tracking logs
- No errors thrown

**Troubleshooting**:
- Events not showing?
  - Events only tracked for attributed users
  - Confirm signup was completed first
  - Check if you're looking at the right time period
  - Enable debug mode to see event logs

---

### Phase 6: Revenue Tracking Test (5 minutes)

**Goal**: Verify revenue/payment tracking

**Steps**:

1. Go to Products screen

2. Add items to cart:
   - Click "Add to Cart" on any product
   - Should see cart item count increase

3. Complete purchase:
   - User ID: Same as signup user ID
   - Quantity of items should be in cart
   - Click "Purchase"
   - Should see: "Purchase captured successfully!"

4. In Linkrunner Dashboard:
   - Go to Revenue/ROAS section
   - ✅ Revenue should show for the campaign
   - Attributed to your test user

**Expected Results**:
- Payment captured without errors
- Revenue attributed to campaign
- Order appears in user activity
- ROAS calculated

**Important Notes**:
- Revenue only tracked for attributed, signed-up users
- Amount must be a number (not string)
- Include proper event data structure for ecommerce

**Troubleshooting**:
- Revenue not showing?
  - Confirm user is attributed and signed up
  - Check amount is a number: `49.99` not `"49.99"`
  - Verify event data includes required fields
  - Check Dashboard Events page for capture errors

---

### Phase 7: Deep Linking Test (10 minutes)

**Goal**: Verify deep linking works for remarketing

**Steps**:

1. **Setup (first time only)**:
   - Configure deep links in app (usually in app.json or native config)
   - Set URL scheme (e.g., `linkrunnerdemo://`)
   - Deploy app with deep linking configured

2. **Test Deep Link Handler**:
   - Go to Settings screen
   - Enter Deep Link URL: `linkrunnerdemo://product/123?campaign=test`
   - Click "Process Deep Link"
   - Should see: "Deep link processed"

3. **Test with Actual Campaign Link**:
   - Create a campaign with a deep link destination
   - Click the campaign link on device
   - App should open and route to the deep link destination

4. Verify:
   - ✅ App opens when deep link is clicked
   - ✅ App routes to correct content
   - ✅ Console shows deep link handling logs

**Expected Results**:
- Deep links open the app
- App navigates to correct screen
- No crashes or errors
- Deep link data available in app

**Troubleshooting**:
- Deep links not working?
  - Verify URL scheme is registered in native app config
  - Check that handleDeepLink is called on app startup
  - For Universal Links/App Links, verify domain config
  - Test with a simple deep link first
  - Check iOS Keychain for URL scheme issues

---

### Phase 8: Remarketing & Reattribution Test (15 minutes)

**Goal**: Verify remarketing campaigns and reinstall reattribution work

#### Test 8A: Reengagement (Deep Link Open)

**Steps**:

1. Create a second campaign: "Remarketing Test"
   - Set up with a deep link
   - This is your reengagement campaign

2. With the app still installed on your test device:
   - Go to the reengagement campaign link in browser
   - App should open via deep link

3. In Linkrunner Dashboard:
   - Go to Retargeting view
   - ✅ Reengagement campaign should show: **Reengagement: 1**

**Expected Results**:
- Reengagement counted for returning user
- Deep link processed
- Different from "Install" count

---

#### Test 8B: Install Reattribution

**Steps**:

1. Create another campaign: "Reattribution Test"

2. **Uninstall the app** completely from device

3. Open the reattribution campaign link in browser

4. Within 3 minutes, **reinstall and open the app**

5. Go to Home screen
   - Should see attribution data for new campaign

6. In Linkrunner Dashboard > Retargeting view:
   - ✅ Reattribution campaign should show: **Reattribution: 1**

**Expected Results**:
- Reinstall detected as new user
- Attributed to new campaign
- Android backup config working (Android)
- Different from fresh install

**Troubleshooting**:
- Reattribution not detected?
  - Make sure app is FULLY uninstalled
  - On Android, verify backup rules are configured
  - Check timestamp - must reinstall within attribution window
  - Device must be same as original install

---

## Testing Checklist

Use this checklist to track your testing progress:

### Initialization Phase
- [ ] SDK initializes without errors
- [ ] Home screen shows "Linkrunner Initialized"
- [ ] No error messages displayed
- [ ] Console shows init logs

### Attribution Phase
- [ ] Campaign click counted in dashboard
- [ ] Install attributed to campaign
- [ ] App displays campaign details
- [ ] 3-minute window honored

### User Phase
- [ ] User signup successful
- [ ] User ID captured
- [ ] Signup count increases in dashboard
- [ ] User appears in dashboard

### Event Phase
- [ ] Custom events tracked
- [ ] Quick templates work
- [ ] Events appear in Events Settings
- [ ] Event data includes correct fields

### Revenue Phase
- [ ] Payment captured successfully
- [ ] Revenue attributed to campaign
- [ ] Order visible in dashboard
- [ ] ROAS calculated correctly

### Deep Linking Phase
- [ ] Deep link handler test works
- [ ] Campaign deep links open app
- [ ] App navigates to content
- [ ] No crashes or errors

### Remarketing Phase
- [ ] Reengagement tracked
- [ ] Reattribution detected
- [ ] Different campaigns show correctly
- [ ] Reinstall flow works

---

## Common Test Scenarios

### Scenario 1: Testing Multiple Users
1. Change user ID in signup form
2. Sign up as new user
3. Track events for new user
4. Verify separate in dashboard

### Scenario 2: Testing Multiple Campaigns
1. Create 2-3 different campaigns
2. Test click→install flow for each
3. Verify each campaign shows correct data
4. Test attribution switching

### Scenario 3: Testing Offline Events
1. Disable network connection
2. Track events while offline
3. Re-enable network
4. Verify events sync to dashboard

### Scenario 4: Testing App Lifecycle
1. Open app → track events
2. Minimize app (warm start)
3. Tap deep link to reopen
4. Verify deep link handling works

---

## Debug Mode Best Practices

### Enable Debug Logging

In `src/types/index.ts`:
```typescript
DEBUG_MODE: true  // Logs all SDK calls
```

### Console Filtering

Filter logs to see Linkrunner events:
```bash
# Show only Linkrunner logs
console.log(...).filter(msg => msg.includes('[Linkrunner]'))
```

### Key Logs to Watch

```
[Linkrunner] SDK initialized successfully
[Linkrunner] Event tracked: event_name
[Linkrunner] User registered: user_id
[Linkrunner] Payment captured: order_id
[Linkrunner] Attribution data retrieved
[Linkrunner] Deep link handled: url
```

### Debugging Event Issues

Check that events are properly formatted:
```typescript
// ✅ Correct
await trackEvent('purchase', { amount: 99.99 })

// ❌ Wrong - amount is string
await trackEvent('purchase', { amount: '99.99' })

// ❌ Missing required field
await trackEvent('signup')  // Need user data first
```

---

## Troubleshooting By Symptom

### "SDK not initialized"
- **Cause**: SDK initialization failed or not called
- **Fix**: Check credentials, verify network, check logs
- **Test**: Restart app, check Home screen badge

### "Events not appearing"
- **Cause**: User not attributed or signed up yet
- **Fix**: Complete full attribution flow first
- **Test**: Check Dashboard for user signup event

### "Revenue not tracked"
- **Cause**: User not signed up, or amount formatting wrong
- **Fix**: Call signup() first, ensure amount is number
- **Test**: Check that signed-up user made purchase

### "Deep links not working"
- **Cause**: URL scheme not registered or handler not called
- **Fix**: Configure native app deep linking, verify handleDeepLink called
- **Test**: Check native app logs for scheme handling

### "Attribution showing wrong campaign"
- **Cause**: Clicking multiple campaigns too quickly
- **Fix**: Uninstall and restart test with single campaign
- **Test**: Leave 30+ seconds between campaign clicks

---

## Performance Testing

### Load Testing Events
```typescript
// Test event tracking performance
for (let i = 0; i < 100; i++) {
  await linkrunner.trackEvent(`event_${i}`, { index: i });
}
```

### Memory Testing
- Monitor memory usage during event tracking
- Check for memory leaks after extended use
- Verify cleanup after app backgrounding

### Network Testing
- Test with slow network (throttle in DevTools)
- Test offline event queuing
- Verify retries on connection failure

---

## CI/CD Integration

### Automated Testing Script
```bash
#!/bin/bash
# Run automated tests
npm run test

# Check integration
npm run integration-test

# Generate coverage report
npm run coverage
```

### GitHub Actions Example
```yaml
- name: Test Linkrunner Integration
  run: |
    npm install
    npm run test
    npm run lint
```

---

## Final Checklist Before Production

- [ ] All test flows completed
- [ ] No errors or warnings in console
- [ ] All features documented
- [ ] Configuration guide prepared
- [ ] Team trained on testing flow
- [ ] Monitoring set up in dashboard
- [ ] Support contact information shared
- [ ] Rollback plan documented

---

## Support

If you encounter issues:

1. **Check the logs**: Console shows detailed information
2. **Review this guide**: Most issues documented here
3. **Check Dashboard**: See event/attribution data
4. **Contact Support**: support@linkrunner.io

Include:
- Console logs (enable debug mode)
- SDK version (from package.json)
- Device type and OS version
- Campaign and user IDs
- Steps to reproduce
