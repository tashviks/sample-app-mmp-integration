# ✅ Setup Complete - Linkrunner Demo App

## What Was Fixed

1. **Babel Configuration** - Renamed `.babelrc` to `babel.config.js` to match JavaScript syntax
2. **Firebase Setup** - Added `google-services.json` (dummy config for development)
3. **Gradle Configuration** - Added Firebase plugin to build.gradle files
4. **Android Build** - Successfully compiled the debug APK
5. **Metro Bundler** - Started and running on port 8081

## Current Status

✅ All dependencies installed
✅ TypeScript compilation successful (no errors)
✅ Android build successful
✅ Metro bundler running

## How to Run the App

### Option 1: Using React Native CLI (Recommended)

In a new terminal window, run:

```bash
cd /Users/tashviksrivastava/Downloads/linkrunner-demo-app
npx react-native run-android
```

This will:
- Build the app if needed
- Install it on your connected Android device or emulator
- Start the app automatically

### Option 2: Manual Installation

If you have the APK already built:

```bash
cd /Users/tashviksrivastava/Downloads/linkrunner-demo-app/android
./gradlew installDebug
```

Then manually launch the app on your device.

### Option 3: Using Android Studio

1. Open Android Studio
2. Open the `android` folder as a project
3. Wait for Gradle sync to complete
4. Click the "Run" button (green play icon)

## Prerequisites

Make sure you have:
- ✅ Android device connected via USB with USB debugging enabled, OR
- ✅ Android emulator running

To check connected devices:
```bash
adb devices
```

## Important Configuration Notes

### 1. Linkrunner Credentials

The app currently uses placeholder credentials. To fully test Linkrunner features, update these files:

**File: `src/types/index.ts`**
```typescript
export const LINKRUNNER_CONFIG = {
  PROJECT_TOKEN: 'YOUR_PROJECT_TOKEN_HERE',
  SECRET_KEY: 'YOUR_SECRET_KEY_HERE',
  KEY_ID: 'YOUR_KEY_ID_HERE',
  DEBUG_MODE: true,
};
```

**File: `src/screens/HomeScreen.tsx`** (line ~35)
```typescript
await LinkrunnerService.initialize(
  'YOUR_PROJECT_TOKEN_HERE',
  'YOUR_SECRET_KEY_HERE',
  'YOUR_KEY_ID_HERE',
  false,
  true
);
```

Get your credentials from: https://dashboard.linkrunner.io/dashboard?s=members&m=documentation

### 2. Firebase Configuration

The app includes a dummy `google-services.json` for development. For production:

1. Create a Firebase project at https://console.firebase.google.com
2. Add an Android app with package name: `com.linkrunner.demo`
3. Download the real `google-services.json`
4. Replace `android/app/google-services.json` with your file

## App Features

The demo app includes:

1. **Home Screen** - SDK initialization and attribution data
2. **Signup Screen** - User registration with Linkrunner
3. **Dashboard Screen** - Custom event tracking
4. **Products Screen** - Ecommerce events (add to cart, purchase)
5. **Settings Screen** - Configuration and testing tools

## Troubleshooting

### Metro Bundler Issues

If Metro is not running, start it manually:
```bash
npm start
```

### Build Errors

Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Device Not Found

Check connected devices:
```bash
adb devices
```

If no devices, either:
- Connect a physical device with USB debugging enabled
- Start an Android emulator from Android Studio

### Port Already in Use

If port 8081 is busy:
```bash
npx react-native start --port 8082
```

Then run the app with:
```bash
npx react-native run-android --port 8082
```

## Next Steps

1. **Connect a device or start an emulator**
2. **Run the app**: `npx react-native run-android`
3. **Update Linkrunner credentials** in the source files
4. **Test the features** using the in-app screens
5. **Check the logs** for Linkrunner SDK events

## Documentation

- Integration Guide: `INTEGRATION_GUIDE.md`
- Testing Guide: `TESTING_GUIDE.md`
- Linkrunner Docs: https://docs.linkrunner.io

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Review the `TESTING_GUIDE.md` for common issues
3. Ensure all prerequisites are met
4. Check that your device/emulator is properly connected

---

**Status**: Ready to run! 🚀

Metro bundler is already running. Just execute `npx react-native run-android` in a new terminal.
