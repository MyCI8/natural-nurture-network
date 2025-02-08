
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
