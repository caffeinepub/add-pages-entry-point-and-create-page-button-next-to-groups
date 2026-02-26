import { isCapacitor } from './runtime';

/**
 * Shim for Internet Identity authentication in Capacitor Android WebView.
 * 
 * This intercepts window.open calls from the AuthClient and redirects them
 * to the Capacitor Browser plugin, which opens the II login in a separate
 * browser context that can properly handle authentication and return to the app.
 */
export function installInternetIdentityShim(): void {
  if (!isCapacitor()) {
    return; // Only install in Capacitor environment
  }

  // Check if Browser plugin is available
  const Browser = (window as any).Capacitor?.Plugins?.Browser;
  if (!Browser) {
    console.warn('[Capacitor] Browser plugin not available. Install @capacitor/browser for II authentication.');
    return;
  }

  // Store original window.open
  const originalWindowOpen = window.open;

  // Override window.open to handle II authentication
  window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
    const urlString = url?.toString() || '';
    
    // Check if this is an Internet Identity URL
    const isIIUrl = urlString.includes('identity.ic0.app') || 
                    urlString.includes('identity.internetcomputer.org');

    if (isIIUrl && isCapacitor()) {
      // Open in Capacitor Browser for proper authentication flow
      Browser.open({ 
        url: urlString,
        presentationStyle: 'popover',
      }).catch((error: any) => {
        console.error('Failed to open II browser:', error);
      });

      // Return a mock window object to satisfy the AuthClient
      return {
        close: () => {
          Browser.close().catch(console.error);
        },
        closed: false,
        focus: () => {},
        blur: () => {},
        postMessage: () => {},
      } as any;
    }

    // For non-II URLs, use original window.open
    return originalWindowOpen.call(window, url, target, features);
  };

  console.log('[Capacitor] Internet Identity shim installed');
}

/**
 * Clean up the shim (if needed for testing)
 */
export function uninstallInternetIdentityShim(): void {
  // This would require storing the original function, but for production
  // we don't need to uninstall it
  console.log('[Capacitor] Internet Identity shim cleanup not implemented');
}
