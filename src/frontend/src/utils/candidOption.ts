/**
 * Utility functions for handling Candid optional values
 * Ensures proper serialization of optional fields for backend communication
 */

import type { ExternalBlob } from "../backend";

export interface MediaContent {
  text: string | null;
  image: ExternalBlob | null;
  video: ExternalBlob | null;
}

/**
 * Normalizes a MediaContent payload for backend submission
 * Converts undefined values to null for proper Candid optional serialization
 */
export function normalizeMediaContent(content: {
  text?: string;
  image?: ExternalBlob;
  video?: ExternalBlob;
}): MediaContent {
  return {
    text: content.text || null,
    image: content.image || null,
    video: content.video || null,
  };
}

/**
 * Validates that text content is not empty or whitespace-only
 */
export function isTextValid(text: string | null | undefined): boolean {
  if (!text) return false;
  return text.trim().length > 0;
}

/**
 * Checks if MediaContent has at least one valid content type
 */
export function hasValidContent(content: {
  text?: string;
  image?: ExternalBlob;
  video?: ExternalBlob;
}): boolean {
  const hasText = isTextValid(content.text);
  const hasImage = !!content.image;
  const hasVideo = !!content.video;

  return hasText || hasImage || hasVideo;
}
