import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
const News = () => {
  const navigate = useNavigate();
  const {
    data: newsItems,
    isLoading
  } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("news_articles").select("*").eq("status", "published").order("published_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  if (isLoading) {
    return <div className="pt-6 sm:pt-12 px-4 w-full">
        <div className="space-y-4 sm:space-y-8">
          {[1, 2, 3].map(i => <Card key={i} className="overflow-hidden border-0 border-b dark:border-dm-mist">
              <CardContent className="p-3 sm:p-4">
                <Skeleton className="w-full aspect-[16/9] rounded-lg sm:rounded-xl mb-3 sm:mb-4 dark:bg-dm-mist-extra" />
                <Skeleton className="h-5 sm:h-6 w-3/4 mb-2 sm:mb-3 dark:bg-dm-mist-extra" />
                <Skeleton className="h-4 w-full mb-2 dark:bg-dm-mist-extra" />
                <Skeleton className="h-4 w-full dark:bg-dm-mist-extra" />
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }
  if (!newsItems?.length) {
    return <div className="pt-6 sm:pt-12 px-4 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-left dark:text-dm-text">News</h1>
        <p className="text-lg sm:text-xl text-text-light dark:text-dm-text-supporting mb-6 sm:mb-8 text-left">Latest Health News Articles</p>
        <p className="text-center text-text-light dark:text-dm-text-supporting py-8 sm:py-12">No news articles available.</p>
      </div>;
  }
  return <div className="pt-6 sm:pt-12 px-4 w-full py-[30px]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold mb-2 text-left dark:text-dm-text sm:text-2xl">News</h1>
        <p className="text-lg text-text-light dark:text-dm-text-supporting text-left sm:text-xl">Latest Health News Articles</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {newsItems.map((article, index) => <Link to={`/news/${article.id}`} key={article.id}>
            <Card className="overflow-hidden border-0 border-b dark:border-dm-mist hover:bg-accent/50 dark:hover:bg-dm-mist-extra/50 transition-colors duration-200">
              <CardContent className="p-3 sm:p-4 py-0 px-[20px]">
                {article.image_url && <div className="relative rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
                    <img src={article.image_url} alt={article.thumbnail_description || article.title} className="w-full object-cover aspect-[16/9]" />
                  </div>}
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-left text-primary dark:text-primary">
                  {article.title}
                </h3>
                <p className="text-sm sm:text-base text-text-light dark:text-dm-text-supporting text-left">
                  {article.summary}
                </p>
              </CardContent>
            </Card>
          </Link>)}
      </div>
    </div>;
};
export default News;