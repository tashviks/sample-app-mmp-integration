# Linkrunner React Native Demo App

## 🚀 Quick Start

A **complete reference implementation** of the Linkrunner SDK for React Native, demonstrating every feature from the official documentation.

### What You'll Learn

✅ SDK initialization and configuration  
✅ User registration and identification  
✅ Event tracking (custom and ecommerce)  
✅ Revenue capture and payment handling  
✅ Deep linking and remarketing  
✅ Privacy controls and security  
✅ Attribution data retrieval  

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- React Native CLI
- Xcode (iOS) or Android Studio (Android)
- Linkrunner account: https://dashboard.linkrunner.io

## 🔧 Setup (5 minutes)

### 1. Get Your Credentials

Visit your Linkrunner Dashboard:
```
https://dashboard.linkrunner.io/dashboard?s=members&m=documentation
```

Copy:
- Project Token
- Secret Key (optional)
- Key ID (optional)

### 2. Update Configuration

Edit `src/types/index.ts`:

```typescript
export const LINKRUNNER_CONFIG = {
  PROJECT_TOKEN: 'YOUR_TOKEN_HERE',
  SECRET_KEY: 'YOUR_SECRET_HERE',
  KEY_ID: 'YOUR_KEY_ID_HERE',
  DEBUG_MODE: true,
};
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# iOS
npm run ios

# Android
npm run android
```

## 📚 Learn by Exploring

The app has 5 main screens, each teaching a different aspect:

### 🏠 Home Screen
- SDK initialization
- Attribution data display
- Getting started

### 📝 Signup Screen
- User registration with `signup()`
- Optional user fields
- Analytics platform integration

### 📊 Dashboard Screen
- Custom event tracking
- Event templates for testing
- Attribution retrieval

### 🛍️ Products Screen
- Ecommerce event tracking
- Revenue/payment capture
- Refund handling

### ⚙️ Settings Screen
- SDK configuration
- Privacy controls
- Deep link testing

## 🧪 Quick Test (10 minutes)

Follow the **Integration Testing Flow**:

1. **Click**: Create campaign → Click link
2. **Install**: Build app → Open it
3. **Signup**: Register user
4. **Track**: Fire custom events
5. **Revenue**: Complete purchase
6. **Verify**: Check dashboard

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed steps.

## 📖 Full Documentation

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete implementation guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing
- **[Official Docs](https://docs.linkrunner.io/sdk/react-native)** - SDK reference

## 🎯 Key Files

```
src/
├── services/LinkrunnerService.ts  ← All SDK logic here
├── screens/                       ← Example screens
│   ├── HomeScreen.tsx
│   ├── SignupScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── ProductsScreen.tsx
│   └── SettingsScreen.tsx
├── components/                    ← Reusable UI
└── App.tsx                        ← Navigation & deep linking
```

## 💡 Key Learnings

### Service Layer Pattern

Wrap SDK in a service for:
- Single point of configuration
- Consistent error handling
- Type safety
- Easy testing

See `src/services/LinkrunnerService.ts` for the full pattern.

### Deep Linking

Handle at app level for both cold and warm starts:

```typescript
// App.tsx
useEffect(() => {
  // Cold start
  Linking.getInitialURL().then(url => {
    if (url) LinkrunnerService.handleDeepLink(url);
  });

  // Warm start
  Linking.addEventListener('url', ({ url }) => {
    LinkrunnerService.handleDeepLink(url);
  });
}, []);
```

### Event Tracking

Always track for attributed users:

```typescript
// 1. Signup first
await LinkrunnerService.registerUser({ id: 'user123' });

// 2. Then track events
await LinkrunnerService.trackEvent('purchase', {
  amount: 99.99,  // For revenue sharing
  product_id: 'item_123'
});
```

### Revenue Tracking

Capture payments with full context:

```typescript
await LinkrunnerService.capturePayment({
  amount: 99.99,
  userId: 'user123',
  paymentId: 'order_456',
  type: 'FIRST_PAYMENT',
  eventData: {
    order_id: 'order_456',
    content_ids: ['product_123'],
    value: 99.99,
    currency: 'USD'
  }
});
```

## 🚨 Common Mistakes to Avoid

❌ **Don't**
- Track events before calling `signup()`
- Pass amount as string: `"99.99"`
- Forget to handle deep links
- Skip the 3-minute window in testing

✅ **Do**
- Call `signup()` immediately when user identity is available
- Pass amounts as numbers: `99.99`
- Handle deep links in app startup
- Follow the complete testing flow

## 📊 What Gets Tracked

| Data | Method | When |
|------|--------|------|
| Clicks | Automatic | User clicks campaign link |
| Installs | Automatic | App opens after install |
| User signup | `signup()` | User creates account |
| Custom events | `trackEvent()` | User actions |
| Revenue | `capturePayment()` | Payment received |
| Deep links | `handleDeepLink()` | App opened via link |

## 🔐 Security

- **Encrypted storage**: Android (v2.10.1+)
- **HTTPS only**: All data encrypted in transit
- **PII hashing**: Optional SHA-256 hashing
- **No plaintext credentials**: Use environment variables

## 🎓 Developer Experience Notes

This implementation demonstrates:

✅ **Clean Code**
- TypeScript for type safety
- Service layer pattern
- Comprehensive comments
- Error handling

✅ **Best Practices**
- Async/await for async operations
- Proper useEffect cleanup
- React Navigation for deep links
- Error boundaries for robustness

✅ **Developer Friendly**
- Debug logging on console
- Clear error messages
- Intuitive UI for testing
- Detailed documentation

## 🐛 Troubleshooting

### SDK not initializing?
1. Check credentials in `src/types/index.ts`
2. Verify network connection
3. Check Dashboard for active project
4. Enable debug mode for detailed logs

### Events not tracking?
1. Make sure user is signed up first
2. Check Events Settings page in dashboard
3. Verify user is attributed to a campaign
4. Enable debug mode to see event logs

### Deep links not working?
1. Configure URL scheme in native app config
2. Verify `handleDeepLink()` is called
3. Test with a simple URL first
4. Check deep link configuration in dashboard

### Revenue not attributed?
1. Verify user is signed up and attributed
2. Check amount is a number, not string
3. Verify event data includes required fields
4. Check payment timestamp is recent

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for more troubleshooting.

## 📞 Support

- 📚 [Full Documentation](https://docs.linkrunner.io)
- 🎥 [Video Walkthroughs](https://docs.linkrunner.io/testing/integration-testing)
- 💬 [Email Support](mailto:support@linkrunner.io)
- 📊 [Dashboard](https://dashboard.linkrunner.io)

## 📋 Checklist for Integration

Use this checklist when integrating Linkrunner into your own app:

- [ ] Install SDK: `npm install rn-linkrunner`
- [ ] Configure iOS: Update Info.plist
- [ ] Configure Android: Update AndroidManifest.xml
- [ ] Initialize SDK: Call `init()` in App startup
- [ ] Handle deep links: Set up in App.tsx
- [ ] User signup: Call `signup()` when user identity available
- [ ] Test attribution: Follow integration testing flow
- [ ] Event tracking: Add custom events
- [ ] Revenue capture: Implement payment tracking
- [ ] Privacy: Enable PII hashing for production
- [ ] Push tokens: Set up for uninstall tracking
- [ ] Testing: Validate in dashboard
- [ ] Production: Update configuration and deploy

## 🎉 Next Steps

1. **Read**: Review [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. **Test**: Follow [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. **Explore**: Check each screen to see patterns
4. **Implement**: Copy patterns to your app
5. **Verify**: Test in Linkrunner dashboard
6. **Deploy**: Roll out to production

## 📝 License

This demo app is provided as-is for educational purposes.

---

**Happy integrating! 🚀**

Questions? Check the [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) or contact [support@linkrunner.io](mailto:support@linkrunner.io)
