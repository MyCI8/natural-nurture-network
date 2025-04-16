import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { useLayout } from "@/contexts/LayoutContext";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
const News = () => {
  const navigate = useNavigate();
  const {
    setShowRightSection
  } = useLayout();
  const isMobile = useIsMobile();
  useEffect(() => {
    setShowRightSection(!isMobile);
    return () => setShowRightSection(false);
  }, [setShowRightSection, isMobile]);
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
    return <div className="pt-6 sm:pt-12 px-4 w-full h-full">
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
    return <div className="pt-6 sm:pt-12 px-4 w-full h-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-left text-text-dark dark:text-dm-text">News</h1>
        <p className="text-lg sm:text-xl text-text dark:text-dm-text-supporting mb-6 sm:mb-8 text-left">Latest Health News Articles</p>
        <p className="text-center text-text dark:text-dm-text-supporting py-8 sm:py-12">No news articles available.</p>
      </div>;
  }
  return <div className="pt-6 sm:pt-12 px-4 w-full h-full py-[16px]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold mb-2 text-left text-text-dark dark:text-dm-text sm:text-2xl">News</h1>
        <p className="text-lg text-text dark:text-dm-text-supporting text-left sm:text-xl">Latest Health News Articles</p>
      </div>

      <div className="space-y-6">
        {newsItems.map((article, index) => <div key={article.id} className="flex flex-col items-center touch-manipulation">
            <Link to={`/news/${article.id}`} className="w-full thumb-friendly">
              <Card className="overflow-hidden border-0 hover:bg-accent/50 dark:hover:bg-dm-mist-extra/50 transition-colors duration-200">
                <CardContent className="p-4">
                  {article.image_url && <div className="relative rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
                      <AspectRatio ratio={16 / 9} className="w-full">
                        <img src={article.image_url} alt={article.thumbnail_description || article.title} className="w-full h-full object-fill" />
                      </AspectRatio>
                    </div>}
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-left text-text-dark dark:text-dm-text">
                    {article.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text dark:text-dm-text-supporting text-left">
                    {article.summary}
                  </p>
                </CardContent>
              </Card>
            </Link>
            {index < newsItems.length - 1 && <Separator className="my-4 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700" />}
          </div>)}
      </div>
    </div>;
};
export default News;