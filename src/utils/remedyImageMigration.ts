
import { supabase } from "@/integrations/supabase/client";

/**
 * Migrates remedy images from main_image_url to image_url field
 * This ensures all remedies use the standardized image_url field
 */
export const migrateRemedyImages = async (): Promise<void> => {
  try {
    console.log('Starting remedy image migration...');
    
    // Get all remedies that have main_image_url but no image_url
    const { data: remediesToMigrate, error: fetchError } = await supabase
      .from('remedies')
      .select('id, name, image_url, main_image_url')
      .not('main_image_url', 'is', null)
      .or('image_url.is.null,image_url.eq.');
    
    if (fetchError) {
      console.error('Error fetching remedies for migration:', fetchError);
      return;
    }
    
    if (!remediesToMigrate || remediesToMigrate.length === 0) {
      console.log('No remedies need image migration');
      return;
    }
    
    console.log(`Found ${remediesToMigrate.length} remedies to migrate:`, remediesToMigrate);
    
    // Update each remedy to copy main_image_url to image_url
    for (const remedy of remediesToMigrate) {
      if (remedy.main_image_url && (!remedy.image_url || remedy.image_url === '')) {
        console.log(`Migrating image for remedy: ${remedy.name}`);
        console.log(`  From main_image_url: ${remedy.main_image_url}`);
        console.log(`  To image_url: ${remedy.main_image_url}`);
        
        const { error: updateError } = await supabase
          .from('remedies')
          .update({ image_url: remedy.main_image_url })
          .eq('id', remedy.id);
        
        if (updateError) {
          console.error(`Error updating remedy ${remedy.name}:`, updateError);
        } else {
          console.log(`✅ Successfully migrated image for remedy: ${remedy.name}`);
        }
      }
    }
    
    console.log('Remedy image migration completed');
  } catch (error) {
    console.error('Error during remedy image migration:', error);
  }
};

/**
 * Validates image files and URLs for upload - RELAXED for UI state
 * This allows empty URLs for new image slots in the UI
 */
export const validateImageForUpload = (image: { file?: File; url: string; description?: string }): boolean => {
  // Allow empty URLs for new image slots (UI state)
  if (!image.url || image.url === '') {
    return true;
  }
  
  // Allow images with File objects (new uploads)
  if (image.file && image.file instanceof File) {
    return true;
  }
  
  // Allow images with valid HTTP URLs (existing stored images)
  if (image.url && 
      !image.url.startsWith('blob:') && 
      (image.url.startsWith('http') || image.url.startsWith('https'))) {
    return true;
  }
  
  // Allow blob URLs temporarily (for cropped images that will be converted to files)
  if (image.url && image.url.startsWith('blob:')) {
    return true;
  }
  
  return false;
};

/**
 * Strict validation for saving - only valid images with files or HTTP URLs
 */
export const validateImageForSaving = (image: { file?: File; url: string; description?: string }): boolean => {
  // Reject empty URLs for saving
  if (!image.url || image.url === '') {
    return false;
  }
  
  // Allow images with File objects (new uploads)
  if (image.file && image.file instanceof File) {
    return true;
  }
  
  // Allow images with valid HTTP URLs (existing stored images)
  if (image.url && 
      !image.url.startsWith('blob:') && 
      (image.url.startsWith('http') || image.url.startsWith('https'))) {
    return true;
  }
  
  // Reject blob URLs for saving
  return false;
};

/**
 * Filters images to only include valid ones for processing
 * This is more permissive to allow the upload flow to work
 */
export const filterValidImages = (images: Array<{ file?: File; url: string; description?: string }>) => {
  return images.filter(img => validateImageForUpload(img));
};

/**
 * Filters images for saving - only includes images ready to be saved
 */
export const filterImagesForSaving = (images: Array<{ file?: File; url: string; description?: string }>) => {
  return images.filter(img => validateImageForSaving(img));
};

/**
 * Validates that all remedies now have images in the image_url field
 */
export const validateRemedyImages = async (): Promise<void> => {
  try {
    console.log('Validating remedy images after migration...');
    
    const { data: remedies, error } = await supabase
      .from('remedies')
      .select('id, name, image_url, main_image_url');
    
    if (error) {
      console.error('Error validating remedies:', error);
      return;
    }
    
    if (!remedies) {
      console.log('No remedies found for validation');
      return;
    }
    
    const remediesToCheck = ['Parasite Cleanse herbal tea', 'Improving the mitochondria'];
    
    remedies.forEach(remedy => {
      if (remediesToCheck.some(name => remedy.name?.includes(name))) {
        console.log(`Remedy: ${remedy.name}`);
        console.log(`  image_url: ${remedy.image_url || 'NULL'}`);
        console.log(`  main_image_url: ${remedy.main_image_url || 'NULL'}`);
        console.log(`  Final image source: ${remedy.image_url || 'MISSING'}`);
      }
    });
    
  } catch (error) {
    console.error('Error validating remedy images:', error);
  }
};
