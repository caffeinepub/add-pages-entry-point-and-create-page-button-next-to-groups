/**
 * Centralized backend error handling utilities.
 * Converts various error types into user-friendly English messages.
 */

export function getBackendErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') {
    return cleanErrorMessage(error);
  }

  if (error instanceof Error) {
    return cleanErrorMessage(error.message);
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, unknown>;

    // IC agent error format
    if (obj.message && typeof obj.message === 'string') {
      return cleanErrorMessage(obj.message);
    }

    // Candid reject
    if (obj.reject_message && typeof obj.reject_message === 'string') {
      return cleanErrorMessage(obj.reject_message as string);
    }

    // Nested error
    if (obj.error) {
      return getBackendErrorMessage(obj.error);
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

function cleanErrorMessage(msg: string): string {
  // Remove IC-specific prefixes
  const cleaned = msg
    .replace(/^Error:\s*/i, '')
    .replace(/^IC0503:\s*/i, '')
    .replace(/^Canister.*?trapped.*?message:\s*/i, '')
    .replace(/^Call failed.*?Reject message:\s*/i, '')
    .replace(/^Reject text:\s*/i, '')
    .trim();

  // Map common backend errors to friendly messages
  if (cleaned.toLowerCase().includes('unauthorized') || cleaned.toLowerCase().includes('only registered users')) {
    return 'You must be logged in to perform this action.';
  }
  if (cleaned.toLowerCase().includes('not found')) {
    return cleaned.replace(/runtime\.trap\s*/i, '').trim() || 'The requested item was not found.';
  }
  if (cleaned.toLowerCase().includes('already voted')) {
    return 'You have already voted on this poll.';
  }
  if (cleaned.toLowerCase().includes('already liked')) {
    return 'You have already liked this post.';
  }
  if (cleaned.toLowerCase().includes('already a member')) {
    return 'You are already a member of this group.';
  }
  if (cleaned.toLowerCase().includes('cannot be empty')) {
    return cleaned;
  }
  if (cleaned.toLowerCase().includes('must have at least')) {
    return cleaned;
  }
  if (cleaned.toLowerCase().includes('content must include')) {
    return 'Please add text, image, or video to your post.';
  }
  if (cleaned.toLowerCase().includes('network') || cleaned.toLowerCase().includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  return cleaned || 'An unexpected error occurred. Please try again.';
}

// Alias for backward compatibility
export const formatBackendError = getBackendErrorMessage;
