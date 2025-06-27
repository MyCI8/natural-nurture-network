
import { useState, useRef, useEffect } from 'react';
import { MediaType, isValidMediaFile } from '@/utils/mediaUtils';

interface MediaProcessingResult {
  url: string;
  type: MediaType;
  filename: string;
}

export function useMediaProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  const processMediaFile = async (file: File): Promise<MediaProcessingResult> => {
    console.log('🔄 Processing media file:', file.name);
    setIsProcessing(true);
    setError(null);

    // Simple timeout protection
    processingTimeoutRef.current = setTimeout(() => {
      console.warn('⚠️ Processing timeout');
      setError('Processing timeout - please try again');
      setIsProcessing(false);
    }, 10000);

    try {
      // Quick validation
      const validation = isValidMediaFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid file type');
      }

      // Create blob URL immediately - this is fast
      const url = URL.createObjectURL(file);
      console.log('✅ Media processed successfully:', url.substring(0, 50) + '...');
      
      // Clear timeout and processing state
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      setIsProcessing(false);
      
      return {
        url,
        type: validation.type,
        filename: file.name
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process media';
      console.error('❌ Processing error:', errorMessage);
      
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

  return {
    processMediaFile,
    isProcessing,
    error,
    clearError
  };
}
