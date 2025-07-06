import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

const PopularRemedies = () => {
  const [maxCards, setMaxCards] = useState(5);

  // Calculate how many cards can fit based on screen height
  useEffect(() => {
    const calculateMaxCards = () => {
      const availableHeight = window.innerHeight - 200; // Account for header, padding, title
      const cardHeight = 72; // Approximate height of each card (64px + spacing)
      const calculatedCards = Math.floor(availableHeight / cardHeight);
      const finalCardCount = Math.min(Math.max(calculatedCards, 3), 10); // Min 3, max 10
      setMaxCards(finalCardCount);
    };

    calculateMaxCards();
    window.addEventListener('resize', calculateMaxCards);
    return () => window.removeEventListener('resize', calculateMaxCards);
  }, []);

  const { data: popularRemedies, isLoading } = useQuery({
    queryKey: ["popularRemedies", maxCards],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(maxCards);

      if (error) {throw error;}
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: maxCards }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mb-1" />
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

      <div>
        {popularRemedies?.map((remedy, index) => (
          <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
            <Card className={`group hover:shadow-lg transition-shadow ${index > 0 ? 'mt-1' : ''}`}>
              <CardContent className="p-2">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
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
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
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
