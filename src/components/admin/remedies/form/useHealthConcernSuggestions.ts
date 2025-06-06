
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PendingConcern, getAllHealthConcerns } from "./HealthConcernsData";

export const useHealthConcernSuggestions = (
  selectedConcerns: string[],
  onConcernsChange: (concerns: string[]) => void
) => {
  const [localPendingConcerns, setLocalPendingConcerns] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available health concerns (static + approved)
  const { data: allAvailableConcerns = [] } = useQuery({
    queryKey: ["all-health-concerns"],
    queryFn: getAllHealthConcerns,
  });

  // Fetch user's pending health concern suggestions
  const { data: pendingSuggestions = [] } = useQuery({
    queryKey: ["health-concern-suggestions"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        const { data, error } = await supabase
          .from("health_concern_suggestions" as any)
          .select("*")
          .eq("suggested_by", user.id)
          .eq("status", "pending");
        
        if (error) {
          console.error("Database error:", error);
          return [];
        }
        
        if (!data || !Array.isArray(data)) return [];
        
        return data
          .filter((item: any) => item && typeof item === 'object' && item.id && item.concern_name)
          .map((item: any) => ({
            id: item.id,
            concern_name: item.concern_name,
            status: item.status || 'pending',
            category: item.category,
            brief_description: item.brief_description
          })) as PendingConcern[];
      } catch (error) {
        console.error("Error fetching pending suggestions:", error);
        return [];
      }
    },
  });

  // Mutation to suggest a new health concern
  const suggestConcernMutation = useMutation({
    mutationFn: async (concernName: string) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Must be logged in to suggest health concerns");

        const { data, error } = await supabase
          .from("health_concern_suggestions" as any)
          .insert({
            concern_name: concernName,
            suggested_by: user.id,
            status: "pending"
          })
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          throw new Error(`Failed to suggest concern: ${error.message || 'Unknown error'}`);
        }
        return { concernName, data };
      } catch (error) {
        console.error("Error suggesting concern:", error);
        throw error;
      }
    },
    onSuccess: ({ concernName }) => {
      toast({
        title: "Suggestion submitted",
        description: `"${concernName}" has been submitted for review and added to your selection`,
      });
      queryClient.invalidateQueries({ queryKey: ["health-concern-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["all-health-concerns"] });
      onConcernsChange([...selectedConcerns, concernName]);
      setLocalPendingConcerns(prev => [...prev, concernName]);
    },
    onError: (error: any) => {
      console.error("Error suggesting concern:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isPendingConcern = (concern: string) => {
    return pendingSuggestions.some(s => s.concern_name === concern) || 
           localPendingConcerns.includes(concern);
  };

  // Clean up local pending when database is updated
  useEffect(() => {
    if (pendingSuggestions.length > 0) {
      const dbPendingNames = pendingSuggestions.map(s => s.concern_name);
      setLocalPendingConcerns(prev => 
        prev.filter(localConcern => !dbPendingNames.includes(localConcern))
      );
    }
  }, [pendingSuggestions]);

  return {
    allAvailableConcerns,
    pendingSuggestions,
    suggestConcernMutation,
    isPendingConcern,
    setLocalPendingConcerns
  };
};
