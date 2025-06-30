
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useExpertStats = (expertId: string) => {
  return useQuery({
    queryKey: ["expert-stats", expertId],
    queryFn: async () => {
      const [remediesResult, newsResult] = await Promise.all([
        supabase
          .from("remedies")
          .select("id", { count: "exact" })
          .contains("expert_recommendations", [expertId])
          .eq("status", "published"),
        supabase
          .from("news_articles")
          .select("id", { count: "exact" })
          .contains("related_experts", [expertId])
          .eq("status", "published")
      ]);

      if (remediesResult.error) throw remediesResult.error;
      if (newsResult.error) throw newsResult.error;

      return {
        remediesCount: remediesResult.count || 0,
        newsCount: newsResult.count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
