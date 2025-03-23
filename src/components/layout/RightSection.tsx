
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsVideos } from "@/components/news/NewsVideos";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Video } from "@/types/video";

interface VideoLink {
  title: string;
  url: string;
}

interface ArticleData {
  video_links?: string | null;
  video_description?: string | null;
}

const RightSection = () => {
  const location = useLocation();
  
  const newsArticleId = location.pathname.startsWith('/news/') 
    ? location.pathname.split('/news/')[1]
    : null;
  
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
  
  const { data: videos } = useQuery<Video[]>({
    queryKey: ["news-videos-sidebar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*, creator:creator_id(*)")
        .eq("status", "published")
        .eq("video_type", "news")
        .eq("showInLatest", true) // Filter videos marked to show in Latest Videos
        .order("created_at", { ascending: false })
        .limit(8);
        
      if (error) {
        console.error("Error fetching videos:", error);
        return [];
      }
      
      return (data || []) as Video[];
    },
    enabled: location.pathname === '/news',
  });
  
  const videoLinks: VideoLink[] = [];
  
  if (articleData?.video_links) {
    const linksData = articleData.video_links;
    
    try {
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
    }
  }
  
  if (location.pathname.startsWith('/news/') && videoLinks.length > 0) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-left pl-2">Related Videos</h3>
        <NewsVideos 
          videoLinks={videoLinks} 
          videoDescription={articleData?.video_description || undefined} 
          isDesktop={true}
        />
      </div>
    );
  }
  
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
      <div className="h-full p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-left pl-2">Explore Details</h2>
        <p className="text-sm text-muted-foreground text-left pl-2">
          This section shows details about the current explore item.
        </p>
      </div>
    );
  }
  
  if (location.pathname.startsWith('/symptoms/')) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-left pl-2">Related Content</h2>
        <p className="text-sm text-muted-foreground text-left pl-2">
          This section shows content related to the current symptom.
        </p>
      </div>
    );
  }
  
  return (
    <div className="h-full p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-left pl-2">Additional Information</h2>
      <p className="text-sm text-muted-foreground text-left pl-2">
        This panel displays contextual information related to the current page.
      </p>
    </div>
  );
};

export default RightSection;
