
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type Expert = Database["public"]["Tables"]["experts"]["Row"];

interface RelatedNewsExpertsProps {
  experts: Expert[];
}

export const RelatedNewsExperts = ({ experts }: RelatedNewsExpertsProps) => {
  if (!experts || experts.length === 0) {return null;}

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">Related Experts</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {experts.map((expert) => (
          <Link key={expert.id} to={`/experts/${expert.id}`}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-3">
                {expert.image_url ? (
                  <img
                    src={expert.image_url}
                    alt={expert.full_name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl text-text-light">
                      {expert.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-semibold text-sm text-center line-clamp-1">{expert.full_name}</h3>
                <p className="text-text-light text-xs text-center line-clamp-1">{expert.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
