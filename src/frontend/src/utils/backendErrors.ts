/**
 * Centralized backend error handling utilities
 * Converts backend errors into user-friendly English messages
 */

/**
 * Extracts a user-safe error message from various error types
 */
export function formatBackendError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Handle trap messages from backend
    if (message.includes('trap')) {
      // Extract the trap message if available
      const trapMatch = message.match(/trap[:\s]+(.+?)(?:\n|$)/i);
      if (trapMatch && trapMatch[1]) {
        return trapMatch[1].trim();
      }
      return 'The operation was rejected by the system';
    }
    
    // Handle authentication errors
    if (message.includes('Unauthorized') || message.includes('not authenticated')) {
      return 'Please log in to perform this action';
    }
    
    // Handle actor availability errors
    if (message.includes('Actor not available')) {
      return 'System is initializing. Please wait a moment and try again';
    }
    
    // Handle content validation errors
    if (message.includes('Content must include')) {
      return 'Please add text, an image, or a video to your post';
    }
    
    // Return the original message if it's already user-friendly
    if (message.length > 0 && message.length < 200) {
      return message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as any).message;
    if (typeof msg === 'string') {
      return formatBackendError(new Error(msg));
    }
  }

  return 'An unexpected error occurred. Please try again';
}

/**
 * Checks if an error indicates the user needs to log in
 */
export function isAuthenticationError(error: unknown): boolean {
  const message = formatBackendError(error).toLowerCase();
  return message.includes('log in') || 
         message.includes('unauthorized') || 
         message.includes('not authenticated');
}

/**
 * Checks if an error indicates the system is not ready
 */
export function isSystemNotReadyError(error: unknown): boolean {
  const message = formatBackendError(error).toLowerCase();
  return message.includes('actor not available') || 
         message.includes('initializing') ||
         message.includes('system is');
}
