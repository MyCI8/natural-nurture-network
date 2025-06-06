
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useRemedies = () => {
  return useQuery({
    queryKey: ['remedies'],
    queryFn: async () => {
      console.log('Fetching remedies from database...');
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .order('click_count', { ascending: false });
      
      if (error) {
        console.error('Error fetching remedies:', error);
        throw error;
      }
      
      console.log('Raw remedies data from database:', data);
      console.log('Number of remedies fetched:', data?.length || 0);
      
      // Log image information for each remedy
      data?.forEach((remedy, index) => {
        console.log(`useRemedies - Remedy ${index + 1}:`, {
          id: remedy.id,
          name: remedy.name,
          status: remedy.status,
          image_url: remedy.image_url,
          main_image_url: remedy.main_image_url,
          created_at: remedy.created_at
        });
      });
      
      return data;
    }
  });
};

export const updateRemedyClickCount = async (remedyId: string, currentCount: number) => {
  try {
    console.log(`Updating click count for remedy ${remedyId} from ${currentCount} to ${currentCount + 1}`);
    const { error } = await supabase
      .from('remedies')
      .update({ click_count: currentCount + 1 })
      .eq('id', remedyId);

    if (error) {
      console.error('Error updating remedy click count:', error);
    } else {
      console.log(`Successfully updated click count for remedy ${remedyId}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
