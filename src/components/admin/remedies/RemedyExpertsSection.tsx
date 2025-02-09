
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpertsSection } from "@/components/admin/news/ExpertsSection";
import { supabase } from "@/integrations/supabase/client";

interface RemedyExpertsSectionProps {
  selectedExperts: string[];
  setSelectedExperts: (experts: string[]) => void;
}

export const RemedyExpertsSection = ({
  selectedExperts,
  setSelectedExperts,
}: RemedyExpertsSectionProps) => {
  const queryClient = useQueryClient();
  const { data: experts = [] } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleExpertAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["experts"] });
  };

  return (
    <ExpertsSection
      experts={experts}
      selectedExperts={selectedExperts}
      setSelectedExperts={setSelectedExperts}
      onExpertAdded={handleExpertAdded}
    />
  );
};
