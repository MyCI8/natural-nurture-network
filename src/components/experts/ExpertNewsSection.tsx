
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ExpertNewsSectionProps {
  expertId: string;
}

export const ExpertNewsSection = ({ expertId }: ExpertNewsSectionProps) => {
  const navigate = useNavigate();

  const { data: articles = [] } = useQuery({
    queryKey: ["expert-news-articles", expertId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id, title, summary, image_url, published_at, status")
        .contains("related_experts", [expertId])
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) {throw error;}
      return data || [];
    },
  });

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Related News ({articles.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 touch-manipulation"
              onClick={() => navigate(`/news/${article.id}`)}
            >
              <CardContent className="p-0">
                {article.image_url && (
                  <AspectRatio ratio={16/9} className="bg-muted">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </AspectRatio>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.summary}
                  </p>
                  {article.published_at && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(article.published_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
