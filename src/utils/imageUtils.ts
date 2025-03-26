
import { supabase } from "@/integrations/supabase/client";

export const moveImageToPublicBucket = async (imageUrl: string): Promise<string | null> => {
  if (!imageUrl || !imageUrl.includes('news-images-draft')) return imageUrl;
  
  try {
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return null;

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('news-images-draft')
      .download(fileName);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return null;
    }

    const { error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(fileName, fileData, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading to public bucket:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('news-images')
      .getPublicUrl(fileName);

    await supabase.storage
      .from('news-images-draft')
      .remove([fileName]);

    return publicUrl;
  } catch (error) {
    console.error('Error moving image:', error);
    return null;
  }
};

export const uploadProfileImage = async (file: File, userId: string): Promise<string | null> => {
  if (!file || !userId) return null;
  
  try {
    console.log(`Starting profile image upload for user ${userId}`, file);
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload the file to the avatars bucket
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading profile image:', uploadError);
      return null;
    }

    console.log('Profile image uploaded successfully', data);
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('Generated public URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in profile image upload:', error);
    return null;
  }
};

// Convert base64 data URL to a File object
export const dataURLtoFile = async (dataUrl: string, filename: string): Promise<File | null> => {
  try {
    if (!dataUrl.startsWith('data:')) {
      // If it's already a URL, not a data URL, return null
      console.log('Not a data URL, skipping conversion:', dataUrl.substring(0, 20) + '...');
      return null;
    }
    
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    console.log('Successfully converted data URL to file:', filename, blob.type, blob.size);
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Error converting data URL to file:', error);
    return null;
  }
};
