#!/bin/bash

# Linkrunner Demo App - Quick Run Script
# This script helps you run the Android app quickly

echo "🚀 Linkrunner Demo App - Android Runner"
echo "========================================"
echo ""

# Check if Metro is running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Metro bundler is already running on port 8081"
else
    echo "⚠️  Metro bundler is not running"
    echo "Starting Metro bundler..."
    npm start &
    sleep 5
fi

echo ""
echo "Checking for connected Android devices..."
adb devices

echo ""
echo "📱 Running the app on Android..."
echo ""

npx react-native run-android

echo ""
echo "✅ Done! The app should now be running on your device/emulator."
echo ""
echo "If you see any errors:"
echo "  1. Make sure an Android device/emulator is connected"
echo "  2. Check that USB debugging is enabled"
echo "  3. Try running: adb devices"
echo ""
