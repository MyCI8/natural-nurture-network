
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpertsSection } from "@/components/admin/news/ExpertsSection";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface RemedyExpertsSectionProps {
  selectedExperts: string[];
  setSelectedExperts: (experts: string[]) => void;
}

export const RemedyExpertsSection = ({
  selectedExperts,
  setSelectedExperts,
}: RemedyExpertsSectionProps) => {
  const queryClient = useQueryClient();
  
  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleExpertAdded = () => {
    // Immediately invalidate and refetch the experts query
    queryClient.invalidateQueries({ queryKey: ["experts"] });
  };

  // This effect will run when the component mounts and whenever the experts data changes
  useEffect(() => {
    if (isLoading) return;
    if (import.meta.env.DEV) console.log("Experts loaded:", experts.length);
  }, [experts, isLoading]);

  return (
    <ExpertsSection
      experts={experts}
      selectedExperts={selectedExperts}
      setSelectedExperts={setSelectedExperts}
      onExpertAdded={handleExpertAdded}
    />
  );
};
