/**
 * Derives a runtime build identifier from the currently loaded module script URL.
 * This helps diagnose stale-client or artifact-mismatch issues after redeploy.
 */
export function getBuildId(): string {
  try {
    // Try to extract hash from the main script URL
    const scripts = document.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      // Look for hashed asset filenames like index-abc123.js
      const match = src.match(/index-([a-f0-9]+)\.js/);
      if (match) {
        return match[1].substring(0, 8);
      }
    }

    // Fallback: use timestamp of page load
    return `t${Date.now().toString(36)}`;
  } catch (_error) {
    return "unknown";
  }
}
