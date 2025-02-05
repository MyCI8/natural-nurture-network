import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import RemedyCard from "@/components/remedies/RemedyCard";

interface ExpertRemediesSectionProps {
  expertId: string;
}

export const ExpertRemediesSection = ({ expertId }: ExpertRemediesSectionProps) => {
  const navigate = useNavigate();

  const { data: remedies = [] } = useQuery({
    queryKey: ["expert-remedies", expertId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_remedies")
        .select(`
          remedies (
            id,
            name,
            summary,
            image_url
          )
        `)
        .eq("expert_id", expertId);

      if (error) throw error;
      return data.map((item) => item.remedies);
    },
  });

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Recommended Remedies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remedies.map((remedy) => (
            <RemedyCard
              key={remedy.id}
              id={remedy.id}
              name={remedy.name}
              summary={remedy.summary}
              imageUrl={remedy.image_url}
              onClick={(id) => navigate(`/remedies/${id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};