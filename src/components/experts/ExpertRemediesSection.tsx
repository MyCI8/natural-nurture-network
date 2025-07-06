
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
        .from("remedies")
        .select("id, name, summary, image_url, status")
        .contains("expert_recommendations", [expertId])
        .eq("status", "published");

      if (error) {throw error;}
      return data || [];
    },
  });

  if (remedies.length === 0) {
    return (
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recommended Remedies</h2>
          <div className="text-center py-8 text-muted-foreground">
            No remedies found for this expert.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Recommended Remedies ({remedies.length})</h2>
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
