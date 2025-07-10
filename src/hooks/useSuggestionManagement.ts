
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const useSuggestionManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [] } = useQuery({
    queryKey: ["expert-suggestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleApproveSuggestion = async (suggestion: {
    id: string;
    full_name: string;
    image_url: string | null;
    comment: string | null;
    social_links: Json;
  }) => {
    const { error: insertError } = await supabase
      .from("experts")
      .insert([
        {
          full_name: suggestion.full_name,
          title: "Expert",
          image_url: suggestion.image_url,
          social_media: suggestion.social_links,
          bio: suggestion.comment,
        },
      ]);

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to approve expert suggestion",
        variant: "destructive",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("expert_suggestions")
      .update({ status: "approved" })
      .eq("id", suggestion.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update suggestion status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Expert suggestion approved successfully",
    });
    queryClient.invalidateQueries({ queryKey: ["admin-experts"] });
    queryClient.invalidateQueries({ queryKey: ["expert-suggestions"] });
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    const { error } = await supabase
      .from("expert_suggestions")
      .update({ status: "rejected" })
      .eq("id", suggestionId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject expert suggestion",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Expert suggestion rejected successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["expert-suggestions"] });
    }
  };

  return {
    suggestions,
    handleApproveSuggestion,
    handleRejectSuggestion,
  };
};
