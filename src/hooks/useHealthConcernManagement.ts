
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthConcernSuggestion {
  id: string;
  concern_name: string;
  category?: string;
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
        
        console.log("📊 Health concerns query result:", { healthConcerns, healthConcernsError });
        
        if (healthConcernsError) {
          console.error("❌ Error fetching health concerns:", healthConcernsError);
          throw healthConcernsError;
        }
        
        const allConcerns = healthConcerns || [];
        console.log("✅ Successfully fetched health concerns:", allConcerns.length, "items");
        
        const suggestedByIds = allConcerns
          .map((item: any) => item.suggested_by)
          .filter((id: any): id is string => typeof id === 'string' && id !== 'system');
        
        const userIds: string[] = Array.from(new Set(suggestedByIds));
        let userEmails: Record<string, string> = {};
        
        if (userIds.length > 0) {
          console.log("👥 Fetching user emails for IDs:", userIds);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds);
          
          if (profiles) {
            userEmails = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile.email || 'Unknown';
              return acc;
            }, {} as Record<string, string>);
            console.log("📧 User emails mapped:", userEmails);
          }
        }
        
        const finalResults = allConcerns.map((item: any) => ({
          id: item.id,
          concern_name: item.concern_name,
          suggested_by: item.suggested_by,
          status: item.status,
          created_at: item.created_at,
          reviewed_at: item.reviewed_at,
          reviewed_by: item.reviewed_by,
          user_email: userEmails[item.suggested_by] || (item.suggested_by === 'system' ? 'System' : 'Unknown')
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
          reviewed_by: user.user?.id 
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
