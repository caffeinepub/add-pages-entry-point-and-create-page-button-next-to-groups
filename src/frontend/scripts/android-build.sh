#!/bin/bash

# CivWorld Android Build Script
# Usage: ./scripts/android-build.sh [debug|release]

set -e  # Exit on error

BUILD_TYPE="${1:-debug}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Building CivWorld Android App ($BUILD_TYPE)"
echo "================================================"

# Step 1: Build web app
echo ""
echo "📦 Step 1: Building web app..."
cd "$FRONTEND_DIR"
pnpm build

if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found. Web build failed."
  exit 1
fi

echo "✅ Web build complete"

# Step 2: Sync to Android
echo ""
echo "🔄 Step 2: Syncing to Android..."
npx cap sync android

if [ ! -d "android" ]; then
  echo "❌ Error: android directory not found. Run 'npx cap add android' first."
  exit 1
fi

echo "✅ Sync complete"

# Step 3: Build Android app
echo ""
echo "🔨 Step 3: Building Android $BUILD_TYPE..."
cd "$FRONTEND_DIR/android"

if [ "$BUILD_TYPE" = "release" ]; then
  # Check if keystore.properties exists
  if [ ! -f "keystore.properties" ]; then
    echo "⚠️  Warning: keystore.properties not found."
    echo "   For release builds, you need to configure signing."
    echo "   See ANDROID_PLAY_STORE_BUILD.md for details."
    echo ""
    read -p "Continue with unsigned build? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
  
  ./gradlew bundleRelease
  
  echo ""
  echo "✅ Release AAB built successfully!"
  echo ""
  echo "📦 Output: android/app/build/outputs/bundle/release/app-release.aab"
  echo ""
  echo "Next steps:"
  echo "1. Test the build: ./gradlew assembleRelease && adb install app/build/outputs/apk/release/app-release.apk"
  echo "2. Upload to Play Console: https://play.google.com/console"
  echo ""
  
elif [ "$BUILD_TYPE" = "debug" ]; then
  ./gradlew assembleDebug
  
  echo ""
  echo "✅ Debug APK built successfully!"
  echo ""
  echo "📦 Output: android/app/build/outputs/apk/debug/app-debug.apk"
  echo ""
  echo "To install on device:"
  echo "  adb install app/build/outputs/apk/debug/app-debug.apk"
  echo ""
  echo "Or run directly:"
  echo "  npx cap run android"
  echo ""
  
else
  echo "❌ Error: Invalid build type '$BUILD_TYPE'. Use 'debug' or 'release'."
  exit 1
fi

echo "================================================"
echo "🎉 Build complete!"
