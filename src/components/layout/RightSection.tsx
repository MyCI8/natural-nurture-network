
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsVideos } from "@/components/news/NewsVideos";

const RightSection = () => {
  const location = useLocation();
  
  // Extract the ID from the URL for news article pages
  const newsArticleId = location.pathname.startsWith('/news/') 
    ? location.pathname.split('/news/')[1]
    : null;
  
  // Fetch video data for news articles
  const { data: articleData } = useQuery({
    queryKey: ["news-article-videos", newsArticleId],
    queryFn: async () => {
      if (!newsArticleId) return null;
      
      const { data, error } = await supabase
        .from("news_articles")
        .select("video_links, video_description")
        .eq("id", newsArticleId)
        .single();
        
      if (error) {
        console.error("Error fetching article video data:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!newsArticleId,
  });
  
  // Process video links
  const videoLinks = (() => {
    try {
      if (!articleData?.video_links || !Array.isArray(articleData.video_links)) {
        return [];
      }
      
      return articleData.video_links
        .filter(link => link && typeof link === 'object')
        .map(link => {
          const linkObj = typeof link === 'string' ? JSON.parse(link) : link;
          return {
            title: typeof linkObj.title === 'string' ? linkObj.title : '',
            url: typeof linkObj.url === 'string' ? linkObj.url : ''
          };
        })
        .filter(link => link.url.trim() !== '');
    } catch (error) {
      console.error("Error processing video links:", error);
      return [];
    }
  })();
  
  // Custom content based on route
  if (location.pathname.startsWith('/news/') && videoLinks.length > 0) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <NewsVideos 
          videoLinks={videoLinks} 
          videoDescription={articleData?.video_description} 
          isDesktop={true}
        />
      </div>
    );
  }
  
  if (location.pathname.startsWith('/explore/')) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Explore Details</h2>
        <p className="text-sm text-muted-foreground">
          This section shows details about the current explore item.
        </p>
      </div>
    );
  }
  
  if (location.pathname.startsWith('/symptoms/')) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Related Content</h2>
        <p className="text-sm text-muted-foreground">
          This section shows content related to the current symptom.
        </p>
      </div>
    );
  }
  
  // Default content
  return (
    <div className="h-full p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
      <p className="text-sm text-muted-foreground">
        This panel displays contextual information related to the current page.
      </p>
    </div>
  );
};

export default RightSection;
