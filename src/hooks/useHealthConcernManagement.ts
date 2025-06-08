import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthConcernSuggestion {
  id: string;
  concern_name: string;
  brief_description?: string;
  suggested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_email?: string;
}

export const useHealthConcernManagement = (
  filter: 'all' | 'pending' | 'approved' | 'rejected',
  searchQuery: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ["admin-health-concern-suggestions", filter, searchQuery],
    queryFn: async () => {
      console.log("🔍 Fetching health concern suggestions with filter:", filter, "search:", searchQuery);
      
      try {
        const supabaseAny = supabase as any;
        
        let query = supabaseAny
          .from("health_concern_suggestions")
          .select(`
            id,
            concern_name,
            brief_description,
            suggested_by,
            status,
            created_at,
            reviewed_at,
            reviewed_by
          `);
        
        if (filter !== 'all') {
          query = query.eq("status", filter);
        }
        
        if (searchQuery) {
          query = query.ilike("concern_name", `%${searchQuery}%`);
        }
        
        const { data: healthConcerns, error: healthConcernsError } = await query.order("created_at", { ascending: false });
        
        console.log("📊 Health concerns raw query result:", { healthConcerns, healthConcernsError });
        
        if (healthConcernsError) {
          console.error("❌ Error fetching health concerns:", healthConcernsError);
          throw healthConcernsError;
        }
        
        const allConcerns = healthConcerns || [];
        console.log("✅ Successfully fetched health concerns:", allConcerns.length, "items");
        console.log("📋 First few items:", allConcerns.slice(0, 3));
        
        // For system suggestions, just use 'System' as user_email
        const finalResults = allConcerns.map((item: any) => ({
          id: item.id,
          concern_name: item.concern_name,
          brief_description: item.brief_description,
          suggested_by: item.suggested_by,
          status: item.status,
          created_at: item.created_at,
          reviewed_at: item.reviewed_at,
          reviewed_by: item.reviewed_by,
          user_email: item.suggested_by === 'system' ? 'System' : 'User'
        })) as HealthConcernSuggestion[];
        
        console.log("🎯 Final results:", finalResults.length, "items");
        console.log("📋 Results breakdown by status:", {
          pending: finalResults.filter(r => r.status === 'pending').length,
          approved: finalResults.filter(r => r.status === 'approved').length,
          rejected: finalResults.filter(r => r.status === 'rejected').length
        });
        
        return finalResults;
        
      } catch (error) {
        console.error("💥 Critical error in health concerns query:", error);
        throw error;
      }
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      console.log("🔄 Updating suggestion:", id, "to status:", status);
      
      const { data: user } = await supabase.auth.getUser();
      const supabaseAny = supabase as any;
      
      const { error } = await supabaseAny
        .from("health_concern_suggestions")
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id || 'system'
        })
        .eq("id", id);
      
      if (error) {
        console.error("❌ Error updating suggestion:", error);
        throw error;
      }
      
      console.log("✅ Successfully updated suggestion");
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Health concern ${variables.status} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concern-suggestions"] });
    },
    onError: (error) => {
      console.error("❌ Error in update mutation:", error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive",
      });
    },
  });

  const deleteSuggestionMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ Deleting suggestion:", id);
      
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from("health_concern_suggestions")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("❌ Error deleting suggestion:", error);
        throw error;
      }
      
      console.log("✅ Successfully deleted suggestion");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health concern deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concern-suggestions"] });
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
    suggestions,
    isLoading,
    error,
    updateSuggestionMutation,
    deleteSuggestionMutation
  };
};
