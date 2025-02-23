
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const News = () => {
  const navigate = useNavigate();
  
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="pt-12">
        <div className="max-w-[800px] mx-auto px-2">
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-0 border-b">
                <CardContent className="p-4">
                  <Skeleton className="w-full aspect-[16/9] rounded-xl mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!newsItems?.length) {
    return (
      <div className="pt-12">
        <div className="max-w-[800px] mx-auto px-2">
          <h1 className="text-4xl font-bold mb-2">News</h1>
          <p className="text-xl text-text-light mb-8">Latest Health News Articles</p>
          <p className="text-center text-text-light py-12">No news articles available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="max-w-[800px] mx-auto px-2">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">News</h1>
          <p className="text-xl text-text-light">Latest Health News Articles</p>
        </div>

        <div className="space-y-6">
          {newsItems.map((article) => (
            <Link to={`/news/${article.id}`} key={article.id}>
              <Card className="overflow-hidden border-0 border-b hover:bg-accent/50 transition-colors duration-200">
                <CardContent className="p-4">
                  {article.image_url && (
                    <div className="relative rounded-xl overflow-hidden mb-4">
                      <img
                        src={article.image_url}
                        alt={article.thumbnail_description || article.title}
                        className="w-full object-cover aspect-[16/9]"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">
                    {article.title}
                  </h3>
                  <p className="text-text-light">
                    {article.summary}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
