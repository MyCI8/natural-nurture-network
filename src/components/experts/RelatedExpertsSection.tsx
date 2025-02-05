import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RelatedExpertsSectionProps {
  currentExpertId: string;
  fieldOfExpertise: string;
}

export const RelatedExpertsSection = ({
  currentExpertId,
  fieldOfExpertise,
}: RelatedExpertsSectionProps) => {
  const navigate = useNavigate();

  const { data: experts = [] } = useQuery({
    queryKey: ["related-experts", currentExpertId, fieldOfExpertise],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("id, full_name, field_of_expertise, image_url")
        .eq("field_of_expertise", fieldOfExpertise)
        .neq("id", currentExpertId)
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  if (experts.length === 0) return null;

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Related Experts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="cursor-pointer group"
              onClick={() => navigate(`/experts/${expert.id}`)}
            >
              <img
                src={expert.image_url || "/placeholder.svg"}
                alt={expert.full_name}
                className="w-full aspect-square rounded-full object-cover mb-4 group-hover:opacity-80 transition-opacity"
              />
              <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                {expert.full_name}
              </h3>
              <p className="text-text-light text-center">{expert.field_of_expertise}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};