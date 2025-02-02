import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useRemedies = () => {
  return useQuery({
    queryKey: ['remedies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .order('click_count', { ascending: false });
      
      if (error) {
        console.error('Error fetching remedies:', error);
        throw error;
      }
      
      return data;
    }
  });
};

export const updateRemedyClickCount = async (remedyId: string, currentCount: number) => {
  try {
    const { error } = await supabase
      .from('remedies')
      .update({ click_count: currentCount + 1 })
      .eq('id', remedyId);

    if (error) {
      console.error('Error updating remedy click count:', error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};