
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PopularRemedies = () => {
  const { data: popularRemedies, isLoading } = useQuery({
    queryKey: ["popularRemedies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Popular Remedies</h2>
      </div>

      <div className="space-y-3">
        {popularRemedies?.map((remedy) => (
          <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
            <Card className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={remedy.image_url || "/placeholder.svg"}
                      alt={remedy.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {remedy.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {remedy.summary}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">4.8</span>
                      <span className="text-xs text-muted-foreground ml-1">2.3k saves</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularRemedies;
