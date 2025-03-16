
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsVideos } from "@/components/news/NewsVideos";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Video } from "@/types/video";
import { useIsMobile } from "@/hooks/use-mobile";

// Define a simple interface for video links
interface VideoLink {
  title: string;
  url: string;
}

// Define a simple interface for news article data with more precise types
interface ArticleData {
  video_links?: string | null;  // Simplified to just string or null
  video_description?: string | null;
}

const RightSection = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Extract the ID from the URL for news article pages
  const newsArticleId = location.pathname.startsWith('/news/') 
    ? location.pathname.split('/news/')[1]
    : null;
  
  // Fetch video data for news articles with explicit typing to avoid recursion
  const { data: articleData } = useQuery<ArticleData | null>({
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
      
      return data as ArticleData;
    },
    enabled: !!newsArticleId,
  });
  
  // Fetch videos for news page with explicit typing
  const { data: videos } = useQuery<Video[]>({
    queryKey: ["news-videos-sidebar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "published")
        .eq("video_type", "news") // Filter to only show news videos
        .order("created_at", { ascending: false })
        .limit(8);
        
      if (error) {
        console.error("Error fetching videos:", error);
        return [];
      }
      
      return (data || []) as Video[];
    },
    enabled: location.pathname === '/news' || location.pathname === '/' || location.pathname === '/index',
  });
  
  // Process video links from articleData
  const videoLinks: VideoLink[] = [];
  
  if (articleData?.video_links) {
    // Safely handle the video_links data regardless of its format
    const linksData = articleData.video_links;
    
    try {
      // Handle string format (JSON string)
      if (typeof linksData === 'string') {
        const parsed = JSON.parse(linksData);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && typeof item === 'object' && 'url' in item && typeof item.url === 'string') {
              videoLinks.push({
                title: typeof item.title === 'string' ? item.title : '',
                url: item.url
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error processing video links:', e);
      // Continue with empty videoLinks array if parsing fails
    }
  }
  
  // For home/index page
  if (location.pathname === '/' || location.pathname === '/index') {
    return (
      <div className={`h-full overflow-y-auto ${isMobile ? 'pb-12' : 'p-4'}`}>
        <h3 className="text-lg font-semibold mb-4 text-left px-4 pt-4">Latest Videos</h3>
        <div className="space-y-4 px-4">
          {videos && videos.length > 0 ? (
            videos.map((video) => (
              <Link to={`/news/videos/${video.id}`} key={video.id}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-0">
                    <AspectRatio ratio={16/9} className="bg-gray-100">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        video.video_url && video.video_url.includes('youtube.com') && (
                          <img
                            src={`https://img.youtube.com/vi/${video.video_url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        )
                      )}
                    </AspectRatio>
                    <div className="p-3 text-left">
                      <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No videos available</p>
          )}
        </div>
      </div>
    );
  }
  
  // Custom content based on route
  if (location.pathname.startsWith('/news/') && videoLinks.length > 0) {
    return (
      <div className={`h-full overflow-y-auto ${isMobile ? 'pb-12' : 'p-4'}`}>
        <h3 className="text-lg font-semibold mb-4 text-left px-4 pt-4">Related Videos</h3>
        <NewsVideos 
          videoLinks={videoLinks} 
          videoDescription={articleData?.video_description || undefined} 
          isDesktop={!isMobile}
        />
      </div>
    );
  }
  
  // Show videos when on the main news page
  if (location.pathname === '/news' && videos?.length > 0) {
    return (
      <div className={`h-full overflow-y-auto ${isMobile ? 'pb-12' : 'p-4'}`}>
        <h3 className="text-lg font-semibold mb-4 text-left px-4 pt-4">Latest Videos</h3>
        <div className="space-y-4 px-4">
          {videos.map((video) => (
            <Link to={`/news/videos/${video.id}`} key={video.id}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-0">
                  <AspectRatio ratio={16/9} className="bg-gray-100">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      video.video_url && video.video_url.includes('youtube.com') && (
                        <img
                          src={`https://img.youtube.com/vi/${video.video_url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      )
                    )}
                  </AspectRatio>
                  <div className="p-3 text-left">
                    <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  if (location.pathname.startsWith('/explore/')) {
    return (
      <div className={`h-full overflow-y-auto ${isMobile ? 'pb-12' : 'p-4'}`}>
        <h2 className="text-lg font-semibold mb-4 text-left px-4 pt-4">Explore Details</h2>
        <p className="text-sm text-muted-foreground text-left px-4">
          This section shows details about the current explore item.
        </p>
      </div>
    );
  }
  
  if (location.pathname.startsWith('/symptoms/')) {
    return (
      <div className={`h-full overflow-y-auto ${isMobile ? 'pb-12' : 'p-4'}`}>
        <h2 className="text-lg font-semibold mb-4 text-left px-4 pt-4">Related Content</h2>
        <p className="text-sm text-muted-foreground text-left px-4">
          This section shows content related to the current symptom.
        </p>
      </div>
    );
  }
  
  // Default content
  return (
    <div className={`h-full overflow-y-auto ${isMobile ? 'pb-12' : 'p-4'}`}>
      <h2 className="text-lg font-semibold mb-4 text-left px-4 pt-4">Additional Information</h2>
      <p className="text-sm text-muted-foreground text-left px-4">
        This panel displays contextual information related to the current page.
      </p>
    </div>
  );
};

export default RightSection;
