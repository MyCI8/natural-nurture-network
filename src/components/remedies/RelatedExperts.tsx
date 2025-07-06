
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RelatedExpertsProps {
  expertIds: string[];
}

export const RelatedExperts = ({ expertIds }: RelatedExpertsProps) => {
  const navigate = useNavigate();

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["related-experts", expertIds],
    queryFn: async () => {
      if (expertIds.length === 0) {return [];}
      
      const { data, error } = await supabase
        .from("experts")
        .select("id, full_name, title, image_url, field_of_expertise")
        .in("id", expertIds);

      if (error) {throw error;}
      return data || [];
    },
    enabled: expertIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Related Experts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (experts.length === 0) {return null;}

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Related Experts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {experts.map((expert) => (
          <Card
            key={expert.id}
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 touch-manipulation"
            onClick={() => navigate(`/experts/${expert.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img
                  src={expert.image_url || "/placeholder.svg"}
                  alt={expert.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {expert.full_name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {expert.title}
                  </p>
                  {expert.field_of_expertise && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {expert.field_of_expertise}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
