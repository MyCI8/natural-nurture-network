
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout } from "@/contexts/LayoutContext";
import { useIsMobile } from "@/hooks/use-mobile";
import LatestVideos from "@/components/news/LatestVideos";

const News = () => {
  const { setShowRightSection } = useLayout();
  const isMobile = useIsMobile();
  
  // Ensure the right section is always shown on news page
  useEffect(() => {
    setShowRightSection(true);
    
    // No cleanup needed as we want the right section to stay visible
  }, [setShowRightSection]);
  
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
      if (error) {throw error;}
      return data;
    }
  });

  if (isLoading) {
    return <div className="pt-6 sm:pt-12 px-0 sm:px-4 w-full h-full">
        <div className="space-y-4 sm:space-y-8">
          {[1, 2, 3].map(i => <Card key={i} className="overflow-hidden border-0 border-b dark:border-dm-mist mx-0">
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
    return <div className="pt-6 sm:pt-12 px-0 sm:px-4 w-full h-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-left text-text-dark dark:text-dm-text px-4 sm:px-0">News</h1>
        <p className="text-lg sm:text-xl text-text dark:text-dm-text-supporting mb-6 sm:mb-8 text-left px-4 sm:px-0">Latest Health News Articles</p>
        <p className="text-center text-text dark:text-dm-text-supporting py-8 sm:py-12">No news articles available.</p>
      </div>;
  }

  const NewsContent = () => (
    <div className="space-y-6">
      {newsItems.map((article, index) => (
        <div key={article.id} className="flex flex-col items-center touch-manipulation">
          <Link to={`/news/${article.id}`} className="w-full thumb-friendly">
            <Card className="overflow-hidden border-0 hover:bg-accent/50 dark:hover:bg-dm-mist-extra/50 transition-colors duration-200 mx-0">
              <CardContent className="p-4">
                {article.image_url && (
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
                    <AspectRatio ratio={16/9} className="w-full">
                      <img 
                        src={article.image_url} 
                        alt={article.thumbnail_description || article.title} 
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                )}
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-left text-[#222222] dark:text-dm-text">
                  {article.title}
                </h3>
                <p className="text-sm sm:text-base text-[#333333] dark:text-dm-text-supporting text-left">
                  {article.summary}
                </p>
              </CardContent>
            </Card>
          </Link>
          {index < newsItems.length - 1 && (
            <Separator className="my-4 w-1/2 mx-auto bg-gray-200 dark:bg-gray-700" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="pt-6 sm:pt-12 px-0 sm:px-4 w-full h-full">
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <h1 className="text-3xl font-bold mb-2 text-left text-[#1A1F2C] dark:text-dm-text sm:text-2xl">News</h1>
        <p className="text-lg text-[#333333] dark:text-dm-text-supporting text-left sm:text-xl">Latest Health News Articles</p>
      </div>

      {isMobile ? (
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 mx-4">
            <TabsTrigger value="news" className="text-sm">News</TabsTrigger>
            <TabsTrigger value="videos" className="text-sm">Latest Videos</TabsTrigger>
          </TabsList>
          <TabsContent value="news" className="mt-0">
            <NewsContent />
          </TabsContent>
          <TabsContent value="videos" className="mt-0 px-4">
            <LatestVideos />
          </TabsContent>
        </Tabs>
      ) : (
        <NewsContent />
      )}
    </div>
  );
};

export default News;
