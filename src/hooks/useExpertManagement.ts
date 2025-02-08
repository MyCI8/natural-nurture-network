
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useExpertManagement = (
  searchQuery: string,
  sortBy: "name" | "remedies",
  expertiseFilter: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["admin-experts", searchQuery, sortBy, expertiseFilter],
    queryFn: async () => {
      let query = supabase
        .from("experts")
        .select(`
          *,
          expert_remedies(count)
        `);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,field_of_expertise.ilike.%${searchQuery}%`);
      }

      if (expertiseFilter !== "all") {
        query = query.eq("field_of_expertise", expertiseFilter);
      }

      if (sortBy === "name") {
        query = query.order("full_name");
      } else {
        query = query.order("expert_remedies(count)", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: expertiseFields = [] } = useQuery({
    queryKey: ["expertise-fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("field_of_expertise")
        .not("field_of_expertise", "is", null);

      if (error) throw error;
      return [...new Set(data.map(e => e.field_of_expertise))].filter(Boolean);
    },
  });

  const handleDeleteExpert = async (expertId: string) => {
    const { error: remediesError } = await supabase
      .from("expert_remedies")
      .delete()
      .eq("expert_id", expertId);

    if (remediesError) {
      toast({
        title: "Error",
        description: "Failed to delete expert's remedies",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("experts")
      .delete()
      .eq("id", expertId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete expert",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expert deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-experts"] });
    }
  };

  return {
    experts,
    isLoading,
    expertiseFields,
    handleDeleteExpert,
  };
};
