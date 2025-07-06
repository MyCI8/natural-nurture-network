
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Expert } from "@/types/expert";
import { Json } from "@/integrations/supabase/types";

interface UseExpertManagementProps {
  searchQuery: string;
  sortBy: "name" | "remedies";
  expertiseFilter: string;
}

// Helper function to transform the Supabase response to match Expert type
const transformExpertData = (data: any): Expert => {
  return {
    id: data.id,
    full_name: data.full_name,
    title: data.title,
    bio: data.bio || undefined,
    image_url: data.image_url || undefined,
    field_of_expertise: data.field_of_expertise || undefined,
    social_media: data.social_media as Expert['social_media'] || undefined,
    media_links: data.media_links as Expert['media_links'] || undefined,
    affiliations: data.affiliations || [],
    credentials: data.credentials || [],
    expert_remedies: [{ count: data.remedies_count || 0 }],
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const useExpertManagement = ({
  searchQuery,
  sortBy,
  expertiseFilter,
}: UseExpertManagementProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for experts with immediate refresh
  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["admin-experts", searchQuery, sortBy, expertiseFilter],
    queryFn: async () => {
      let query = supabase
        .from("experts")
        .select("*");

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,field_of_expertise.ilike.%${searchQuery}%`);
      }

      if (expertiseFilter !== "all") {
        query = query.eq("field_of_expertise", expertiseFilter);
      }

      if (sortBy === "name") {
        query = query.order("full_name");
      }

      const { data: expertsData, error } = await query;
      if (error) {
        console.error("Error fetching experts:", error);
        throw error;
      }

      // Get remedy counts for each expert
      const expertsWithCounts = await Promise.all(
        (expertsData || []).map(async (expert) => {
          const { count } = await supabase
            .from("remedies")
            .select("id", { count: "exact" })
            .contains("expert_recommendations", [expert.id])
            .eq("status", "published");

          return {
            ...expert,
            remedies_count: count || 0,
          };
        })
      );

      // Sort by remedies count if needed
      if (sortBy === "remedies") {
        expertsWithCounts.sort((a, b) => b.remedies_count - a.remedies_count);
      }

      return expertsWithCounts.map(transformExpertData);
    },
  });

  // Query for expertise fields
  const { data: expertiseFields = [] } = useQuery({
    queryKey: ["expertise-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("field_of_expertise")
        .not("field_of_expertise", "is", null);

      if (error) {
        console.error("Error fetching expertise fields:", error);
        throw error;
      }

      return [...new Set(data.map(e => e.field_of_expertise))].filter(Boolean) as string[];
    },
  });

  // Mutation for deleting experts with automatic invalidation
  const deleteExpertMutation = useMutation({
    mutationFn: async (expertId: string) => {
      // First delete expert's remedies relationships (if any junction table exists)
      const { error: remediesError } = await supabase
        .from("expert_remedies")
        .delete()
        .eq("expert_id", expertId);

      // Note: We ignore the error here since the table might be empty or not used

      // Then delete the expert
      const { error } = await supabase
        .from("experts")
        .delete()
        .eq("id", expertId);

      if (error) {throw error;}
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expert deleted successfully",
      });
      // Invalidate the relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["admin-experts"] });
      queryClient.invalidateQueries({ queryKey: ["expertise-fields"] });
      queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
    onError: (error) => {
      console.error("Error deleting expert:", error);
      toast({
        title: "Error",
        description: "Failed to delete expert",
        variant: "destructive",
      });
    },
  });

  return {
    experts,
    isLoading,
    expertiseFields,
    handleDeleteExpert: deleteExpertMutation.mutate,
  };
};
