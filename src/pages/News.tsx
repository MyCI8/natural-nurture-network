
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
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-text-light hover:text-primary mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="mb-12">
            <Skeleton className="h-12 w-32 mb-4" />
            <Skeleton className="h-6 w-64" />
          </div>

          <div className="mb-16">
            <Skeleton className="w-full aspect-[21/9] rounded-xl mb-8" />
            <Skeleton className="h-8 w-2/3 mb-4" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="w-full aspect-video" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
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
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-text-light hover:text-primary mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold mb-2">News</h1>
          <p className="text-xl text-text-light mb-8">Latest Health News Articles</p>
          <p className="text-center text-text-light py-12">No news articles available.</p>
        </div>
      </div>
    );
  }

  const [featuredArticle, ...otherArticles] = newsItems;

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-text-light hover:text-primary mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">News</h1>
          <p className="text-xl text-text-light">Latest Health News Articles</p>
        </div>

        <Link to={`/news/${featuredArticle.id}`} className="block mb-16">
          <div className="relative rounded-xl overflow-hidden">
            <div className="aspect-[21/9] relative">
              <img
                src={featuredArticle.image_url || "/placeholder.svg"}
                alt={featuredArticle.thumbnail_description || featuredArticle.title}
                className="w-full h-full object-cover"
              />
              <div 
                className="absolute inset-0" 
                style={{
                  background: `linear-gradient(to bottom, 
                    transparent 0%, 
                    transparent 50%, 
                    rgba(255, 255, 255, 0.7) 70%, 
                    rgba(255, 255, 255, 0.9) 85%,
                    rgba(255, 255, 255, 1) 100%
                  )`
                }}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-1/4">
              <h2 className="text-3xl font-bold mb-4 text-text">
                {featuredArticle.title}
              </h2>
              <p className="text-lg text-text-light max-w-2xl">
                {featuredArticle.summary}
              </p>
            </div>
          </div>
        </Link>

        <div className="space-y-8">
          {otherArticles.map((article) => (
            <Link to={`/news/${article.id}`} key={article.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3">
                      <div className="aspect-video md:h-full">
                        <img
                          src={article.image_url || "/placeholder.svg"}
                          alt={article.thumbnail_description || article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <h3 className="text-xl font-semibold text-text mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-text-light line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>
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
