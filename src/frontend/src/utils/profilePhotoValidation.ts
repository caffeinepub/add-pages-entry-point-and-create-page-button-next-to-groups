/**
 * Profile photo validation and processing utilities
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const TARGET_SIZE = 800; // Target dimension for square crop

/**
 * Validates a profile photo file
 * Returns an error message if invalid, null if valid
 */
export function validateProfilePhoto(file: File): string | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return 'Please select a JPG or PNG image';
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return 'Image size must be less than 5MB';
  }

  return null;
}

/**
 * Processes a profile photo: crops to square and compresses
 * Returns the processed File and a preview data URL
 */
export async function processProfilePhoto(file: File): Promise<{
  processedBlob: File;
  previewDataUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    img.onload = () => {
      try {
        // Create canvas for processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Calculate crop dimensions (centered square)
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Set canvas to target size
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;

        // Draw cropped and scaled image
        ctx.drawImage(
          img,
          x, y, size, size,  // Source rectangle
          0, 0, TARGET_SIZE, TARGET_SIZE  // Destination rectangle
        );

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to process image'));
              return;
            }

            // Check if processed size is still too large
            if (blob.size > MAX_FILE_SIZE) {
              reject(new Error('Processed image is still too large. Please try a different image'));
              return;
            }

            // Convert Blob to File
            const processedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            // Create preview URL
            const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9);

            resolve({
              processedBlob: processedFile,
              previewDataUrl,
            });
          },
          'image/jpeg',
          0.9  // Quality
        );
      } catch (error) {
        reject(new Error('Failed to process image'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.readAsDataURL(file);
  });
}
