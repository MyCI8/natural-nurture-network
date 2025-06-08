
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthConcern {
  id: string;
  name: string;
  brief_description?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useHealthConcernManagement = (
  filter: 'all' | 'recent',
  searchQuery: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthConcerns = [], isLoading, error } = useQuery({
    queryKey: ["admin-health-concerns", filter, searchQuery],
    queryFn: async () => {
      console.log("🔍 Fetching health concerns with filter:", filter, "search:", searchQuery);
      
      try {
        let query = supabase
          .from("health_concerns")
          .select("*");
        
        if (filter === 'recent') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.gte("created_at", thirtyDaysAgo.toISOString());
        }
        
        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`);
        }
        
        const { data, error: queryError } = await query.order("created_at", { ascending: false });
        
        console.log("📊 Health concerns query result:", { data, queryError });
        
        if (queryError) {
          console.error("❌ Error fetching health concerns:", queryError);
          throw queryError;
        }
        
        const results = data || [];
        console.log("✅ Successfully fetched health concerns:", results.length, "items");
        
        return results as HealthConcern[];
        
      } catch (error) {
        console.error("💥 Critical error in health concerns query:", error);
        throw error;
      }
    },
  });

  const updateHealthConcernMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HealthConcern> }) => {
      console.log("🔄 Updating health concern:", id, "with data:", data);
      
      const { error } = await supabase
        .from("health_concerns")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) {
        console.error("❌ Error updating health concern:", error);
        throw error;
      }
      
      console.log("✅ Successfully updated health concern");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health concern updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concerns"] });
    },
    onError: (error) => {
      console.error("❌ Error in update mutation:", error);
      toast({
        title: "Error",
        description: "Failed to update health concern",
        variant: "destructive",
      });
    },
  });

  const deleteHealthConcernMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ Deleting health concern:", id);
      
      const { error } = await supabase
        .from("health_concerns")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("❌ Error deleting health concern:", error);
        throw error;
      }
      
      console.log("✅ Successfully deleted health concern");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health concern deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concerns"] });
    },
    onError: (error) => {
      console.error("❌ Error in delete mutation:", error);
      toast({
        title: "Error",
        description: "Failed to delete health concern",
        variant: "destructive",
      });
    },
  });

  return {
    healthConcerns,
    isLoading,
    error,
    updateHealthConcernMutation,
    deleteHealthConcernMutation
  };
};
