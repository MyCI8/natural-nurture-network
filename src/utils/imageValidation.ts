
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates if an image URL is a proper Supabase storage URL
 */
export const isValidStorageImageUrl = (url: string | null | undefined): boolean => {
  if (!url) {return false;}
  
  // Check if it's a valid HTTP URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {return false;}
  
  // Check if it's not a blob URL (temporary URLs)
  if (url.startsWith('blob:')) {return false;}
  
  // Check if it's a Supabase storage URL
  if (url.includes('supabase.co') && url.includes('/storage/v1/object/public/')) {return true;}
  
  // Allow other valid HTTP URLs (for external images)
  return true;
};

/**
 * Gets a safe image URL, falling back to placeholder if invalid
 */
export const getSafeImageUrl = (url: string | null | undefined, fallback: string = "/placeholder.svg"): string => {
  if (isValidStorageImageUrl(url)) {
    return url as string;
  }
  
  console.warn('Invalid image URL detected:', url, 'Using fallback:', fallback);
  return fallback;
};

/**
 * Cleans up blob URLs from the database (admin function)
 */
export const cleanupInvalidImageUrls = async (): Promise<void> => {
  try {
    console.log('Starting cleanup of invalid image URLs...');
    
    // Get all remedies with blob URLs or invalid URLs
    const { data: remediesWithInvalidUrls, error: fetchError } = await supabase
      .from('remedies')
      .select('id, name, image_url')
      .or('image_url.like.blob:%,image_url.is.null');
    
    if (fetchError) {
      console.error('Error fetching remedies with invalid URLs:', fetchError);
      return;
    }
    
    if (!remediesWithInvalidUrls || remediesWithInvalidUrls.length === 0) {
      console.log('No remedies with invalid URLs found');
      return;
    }
    
    console.log(`Found ${remediesWithInvalidUrls.length} remedies with invalid URLs:`, remediesWithInvalidUrls);
    
    // Update all remedies with invalid URLs to use empty string (will trigger placeholder)
    const { error: updateError } = await supabase
      .from('remedies')
      .update({ image_url: '' })
      .or('image_url.like.blob:%,image_url.is.null');
    
    if (updateError) {
      console.error('Error updating remedies with invalid URLs:', updateError);
      return;
    }
    
    console.log('Successfully cleaned up invalid URLs from database');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

/**
 * Ensures the remedy-images bucket exists and has proper permissions
 */
export const ensureRemedyImagesBucket = async (): Promise<boolean> => {
  try {
    console.log('Checking remedy-images bucket access...');
    
    // Try to list files in the bucket (this will fail if bucket doesn't exist or has no permissions)
    const { data, error } = await supabase.storage
      .from('remedy-images')
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Remedy images bucket error:', error);
      console.error('Bucket may not exist or lacks proper public permissions');
      return false;
    }
    
    console.log('Remedy images bucket is accessible');
    return true;
  } catch (error) {
    console.error('Error checking remedy images bucket:', error);
    return false;
  }
};

/**
 * Test image URL accessibility
 */
export const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error testing image URL:', url, error);
    return false;
  }
};
