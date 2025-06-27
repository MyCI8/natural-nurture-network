import { useState, useRef, useEffect } from 'react';
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
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const processMediaFile = async (file: File): Promise<MediaProcessingResult> => {
    console.log('🔄 Starting media processing for file:', file.name, 'size:', file.size);
    setIsProcessing(true);
    setError(null);

    // Set timeout to prevent infinite processing
    processingTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Media processing timeout reached');
      setError('Processing timeout - please try again');
      setIsProcessing(false);
    }, 30000); // 30 second timeout

    try {
      // Validate file type first
      const validation = isValidMediaFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file type');
      }

      console.log('✅ File validation passed, type:', validation.type);

      // Create blob URL for preview
      const url = URL.createObjectURL(file);
      console.log('🔗 Created blob URL:', url);
      
      // Get dimensions with timeout
      let dimensions: { width: number; height: number } | undefined;
      
      try {
        if (validation.type === 'image') {
          console.log('📐 Getting image dimensions...');
          dimensions = await getImageDimensionsWithTimeout(file);
          console.log('📐 Image dimensions:', dimensions);
        } else if (validation.type === 'video') {
          console.log('📐 Getting video dimensions...');
          dimensions = await getVideoDimensionsWithTimeout(file);
          console.log('📐 Video dimensions:', dimensions);
        }
      } catch (dimensionError) {
        console.warn('⚠️ Failed to get dimensions, using defaults:', dimensionError);
        // Use default dimensions if calculation fails
        dimensions = { width: 800, height: 600 };
      }

      // Clear timeout on success
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      console.log('✅ Media processing completed successfully');
      
      return {
        url,
        type: validation.type,
        filename: file.name,
        dimensions
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process media';
      console.error('❌ Media processing error:', errorMessage, err);
      
      // Clear timeout on error
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      setIsProcessing(false);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  // Expose method to clear processing state (to be called by parent)
  const clearProcessing = () => {
    console.log('🔄 Clearing processing state externally');
    setIsProcessing(false);
  };

  return {
    processMediaFile,
    isProcessing,
    error,
    clearError,
    clearProcessing
  };
}

// Helper function to get image dimensions with timeout
function getImageDimensionsWithTimeout(file: File, timeoutMs: number = 5000): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let timeoutId: NodeJS.Timeout;
    let blobUrl = '';

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };

    // Set up timeout
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Image dimension calculation timed out'));
    }, timeoutMs);

    img.onload = () => {
      console.log('Image loaded successfully, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      cleanup();
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = (error) => {
      console.error('Failed to load image for dimension calculation:', error);
      cleanup();
      reject(new Error('Failed to load image'));
    };

    try {
      blobUrl = URL.createObjectURL(file);
      img.src = blobUrl;
    } catch (error) {
      cleanup();
      reject(new Error('Failed to create image URL'));
    }
  });
}

// Helper function to get video dimensions with timeout
function getVideoDimensionsWithTimeout(file: File, timeoutMs: number = 5000): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    let timeoutId: NodeJS.Timeout;
    let blobUrl = '';

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      video.remove();
    };

    // Set up timeout
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Video dimension calculation timed out'));
    }, timeoutMs);

    video.onloadedmetadata = () => {
      console.log('Video metadata loaded, dimensions:', video.videoWidth, 'x', video.videoHeight);
      cleanup();
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };

    video.onerror = (error) => {
      console.error('Failed to load video for dimension calculation:', error);
      cleanup();
      reject(new Error('Failed to load video'));
    };

    try {
      video.preload = 'metadata';
      video.muted = true;
      blobUrl = URL.createObjectURL(file);
      video.src = blobUrl;
    } catch (error) {
      cleanup();
      reject(new Error('Failed to create video URL'));
    }
  });
}
