
import { useState } from 'react';
import { MediaType, isValidMediaFile } from '@/utils/mediaUtils';

interface MediaProcessingResult {
  url: string;
  type: MediaType;
  filename: string;
  dimensions?: { width: number; height: number };
}

export function useMediaProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processMediaFile = async (file: File): Promise<MediaProcessingResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate file type
      const validation = isValidMediaFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file type');
      }

      // Create blob URL for preview
      const url = URL.createObjectURL(file);
      
      // Get dimensions for images
      let dimensions: { width: number; height: number } | undefined;
      
      if (validation.type === 'image') {
        dimensions = await getImageDimensions(file);
      } else if (validation.type === 'video') {
        dimensions = await getVideoDimensions(file);
      }

      return {
        url,
        type: validation.type,
        filename: file.name,
        dimensions
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process media';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setError(null);

  return {
    processMediaFile,
    isProcessing,
    error,
    clearError
  };
}

// Helper function to get image dimensions
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

// Helper function to get video dimensions
function getVideoDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
      reject(new Error('Failed to load video'));
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  });
}
