
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductLink } from '@/types/video';

export function useProductLinks(videoId: string) {
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProductLinks = async () => {
    if (!videoId) {return;}
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', videoId);
        
      if (error) {throw error;}
      
      // Convert the results to ProductLink type
      const typedLinks = data?.map(link => ({
        id: link.id,
        video_id: link.video_id,
        title: link.title,
        url: link.url,
        price: link.price,
        image_url: link.image_url || '',
        description: link.description || '',
        position_x: link.position_x || null,
        position_y: link.position_y || null,
        created_at: link.created_at
      } as ProductLink)) || [];
      
      console.log("Fetched product links:", typedLinks);
      setLinks(typedLinks);
    } catch (error) {
      console.error('Error fetching product links:', error);
      toast.error('Failed to load product links');
    } finally {
      setIsLoading(false);
    }
  };

  const addProductLink = async (productLink: Omit<ProductLink, 'id' | 'created_at'>) => {
    try {
      // Prepare the product link data
      const productLinkData = {
        video_id: videoId,
        title: productLink.title,
        url: productLink.url,
        price: productLink.price,
        image_url: productLink.image_url || null,
        description: productLink.description || null
      };
      
      const { data, error } = await supabase
        .from('video_product_links')
        .insert(productLinkData)
        .select();
        
      if (error) {throw error;}
      
      if (data && data.length > 0) {
        // Create a fully typed ProductLink object from the response
        const newProductLink: ProductLink = {
          id: data[0].id,
          video_id: data[0].video_id,
          title: data[0].title,
          url: data[0].url,
          price: data[0].price,
          image_url: data[0].image_url || '',
          description: data[0].description || '',
          position_x: data[0].position_x || null,
          position_y: data[0].position_y || null,
          created_at: data[0].created_at
        };
        
        setLinks([...links, newProductLink]);
        toast.success('Product link added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding product link:', error);
      toast.error(`Failed to add product link: ${error.message}`);
      throw error;
    }
  };

  const deleteProductLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_product_links')
        .delete()
        .eq('id', id);
        
      if (error) {throw error;}
      
      setLinks(links.filter(link => link.id !== id));
      toast.success('Product link deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting product link:', error);
      toast.error(`Failed to delete product link: ${error.message}`);
      throw error;
    }
  };

  useEffect(() => {
    fetchProductLinks();
  }, [videoId]);

  return {
    links,
    isLoading,
    addProductLink,
    deleteProductLink
  };
}
