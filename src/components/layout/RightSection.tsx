
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsVideos } from "@/components/news/NewsVideos";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// Define a simple interface for video links to avoid type recursion
interface VideoLink {
  title: string;
  url: string;
}

// Define a simple interface for article data
interface ArticleData {
  video_links?: any[];
  video_description?: string;
}

// Define a simple interface for video data
interface VideoData {
  id: string;
  title: string;
  thumbnail_url: string | null;
  video_url: string | null;
  created_at: string;
}

const RightSection = () => {
  const location = useLocation();
  
  // Extract the ID from the URL for news article pages
  const newsArticleId = location.pathname.startsWith('/news/') 
    ? location.pathname.split('/news/')[1]
    : null;
  
  // Fetch video data for news articles
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
  
  // Fetch videos for news page (when on /news)
  const { data: videos } = useQuery<VideoData[]>({
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
      
      return data as VideoData[];
    },
    enabled: location.pathname === '/news',
  });
  
  // Process video links with a simpler approach to avoid type recursion
  const videoLinks: VideoLink[] = [];
  
  if (articleData?.video_links && Array.isArray(articleData.video_links)) {
    for (const link of articleData.video_links) {
      if (!link || typeof link !== 'object') continue;
      
      try {
        // Handle either string or object format
        const linkObj = typeof link === 'string' ? JSON.parse(link) : link;
        
        // Only add valid links with title and url
        if (typeof linkObj.url === 'string' && linkObj.url.trim() !== '') {
          videoLinks.push({
            title: typeof linkObj.title === 'string' ? linkObj.title : '',
            url: linkObj.url
          });
        }
      } catch (e) {
        console.error('Error parsing video link:', e);
        // Skip invalid links
      }
    }
  }
  
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
  
  // Show videos when on the main news page
  if (location.pathname === '/news' && videos?.length > 0) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-left pl-2">Latest Videos</h3>
        <div className="space-y-4">
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
                    <h4 className="font-medium text-sm line-clamp-2 pl-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 pl-2">
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
