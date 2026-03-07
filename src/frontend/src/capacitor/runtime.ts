/**
 * Platform detection utilities for Capacitor environment.
 * These functions safely handle cases where Capacitor is not installed.
 */

/**
 * Detect if the app is running inside Capacitor (native mobile environment)
 */
export function isCapacitor(): boolean {
  try {
    // Check if Capacitor is available on window object
    const cap = (window as any).Capacitor;
    return cap?.isNativePlatform?.() === true;
  } catch {
    return false;
  }
}

/**
 * Get the current platform (ios, android, web)
 */
export function getPlatform(): string {
  try {
    const cap = (window as any).Capacitor;
    return cap?.getPlatform?.() || "web";
  } catch {
    return "web";
  }
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return getPlatform() === "android";
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return getPlatform() === "ios";
}
