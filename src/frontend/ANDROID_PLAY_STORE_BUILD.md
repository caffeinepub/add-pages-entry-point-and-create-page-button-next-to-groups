# Building CivWorld for Google Play Store

This guide covers building a production-ready Android App Bundle (AAB) for Play Store submission.

## Prerequisites

1. **Google Play Developer Account** - Required to publish apps ($25 one-time fee)
2. **App Signing Key** - You'll create this below
3. **Completed Web Build** - Run `pnpm build` first
4. **Android Studio** - For testing and validation

## Step 1: Create a Signing Key

Android apps must be signed with a private key. Create one using `keytool`:

