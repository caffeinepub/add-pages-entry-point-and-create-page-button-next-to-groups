import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.civworld.app',
  appName: 'CivWorld',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://*.ic0.app',
      'https://*.icp0.io',
      'https://*.internetcomputer.org',
      'https://identity.ic0.app',
      'https://identity.internetcomputer.org',
    ],
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
