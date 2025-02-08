
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ExpertListHeader from "./experts/ExpertListHeader";
import ExpertFilters from "./experts/ExpertFilters";
import ExpertList from "./experts/ExpertList";
import SuggestionsList from "./experts/SuggestionsList";

const ManageExpertsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "remedies">("name");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");

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
    // First delete related records
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

    // Then delete the expert
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
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["admin-experts"] });
    }
  };

  const handleApproveSuggestion = async (suggestion: any) => {
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
    // Invalidate both queries to refresh the data
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
      // Invalidate the suggestions query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["expert-suggestions"] });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="experts">
        <TabsList>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
            {suggestions.filter(s => s.status === "pending").length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {suggestions.filter(s => s.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experts">
          <ExpertListHeader />
          <ExpertFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            expertiseFilter={expertiseFilter}
            setExpertiseFilter={setExpertiseFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            expertiseFields={expertiseFields}
          />
          <ExpertList 
            experts={experts}
            onDelete={handleDeleteExpert}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsList
            suggestions={suggestions}
            onApprove={handleApproveSuggestion}
            onReject={handleRejectSuggestion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageExpertsList;
