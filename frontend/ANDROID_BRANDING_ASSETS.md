# Android Branding Assets for CivWorld

This document explains how the branding assets (app icon, adaptive icon, splash screen) are used to generate Android native resources for the CivWorld Capacitor build.

## Source Assets

All source images are stored in `frontend/public/assets/generated/` and are served as static frontend assets (not via backend blob storage):

### 1. App Icon
- **Path:** `frontend/public/assets/generated/civworld-app-icon.dim_1024x1024.png`
- **Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Usage:** Launcher icon for Android (all densities)

### 2. Adaptive Icon Foreground
- **Path:** `frontend/public/assets/generated/civworld-adaptive-foreground.dim_432x432.png`
- **Size:** 432x432 pixels
- **Format:** PNG with transparency
- **Usage:** Foreground layer of Android adaptive icon (API 26+)

### 3. Adaptive Icon Background
- **Path:** `frontend/public/assets/generated/civworld-adaptive-background.dim_432x432.png`
- **Size:** 432x432 pixels
- **Format:** PNG (can be solid color or pattern)
- **Usage:** Background layer of Android adaptive icon (API 26+)

### 4. Splash Screen
- **Path:** `frontend/public/assets/generated/civworld-splash.dim_2732x2732.png`
- **Size:** 2732x2732 pixels
- **Format:** PNG
- **Usage:** Splash screen shown while WebView initializes

## How Assets Are Used

### App Icon Generation

The source icon (`civworld-app-icon.dim_1024x1024.png`) is used to generate multiple density versions for Android:

