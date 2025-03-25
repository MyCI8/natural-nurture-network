
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsVideos } from "@/components/news/NewsVideos";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Video } from "@/types/video";
import { Separator } from "@/components/ui/separator";
import Comments from "@/components/video/Comments";

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
  const { id } = useParams();
  
  // Get current user for comments
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });
  
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
      console.log("Fetching latest videos for sidebar");
      const { data, error } = await supabase
        .from("videos")
        .select("*, creator:creator_id(*), related_article_id")
        .eq("status", "published")
        .eq("video_type", "news")
        .eq("show_in_latest", true)
        .order("created_at", { ascending: false })
        .limit(8);
        
      if (error) {
        console.error("Error fetching videos:", error);
        return [];
      }
      
      console.log("Latest videos fetched:", data);
      return (data || []).map(video => ({
        ...video,
        related_article_id: video.related_article_id || null
      })) as Video[];
    },
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
  
  return (
    <div className="h-full flex flex-col relative">
      <Separator orientation="vertical" className="absolute left-0 top-0 h-full" />
      
      <div className="p-4 overflow-y-auto flex-1">
        {location.pathname.startsWith('/news/') && videoLinks.length > 0 && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Related Videos</h2>
            <NewsVideos 
              videoLinks={videoLinks} 
              videoDescription={articleData?.video_description || undefined} 
              isDesktop={true}
            />
          </>
        )}
        
        {(location.pathname === '/news' || location.pathname === '/news/') && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Latest Videos</h2>
            {videos && videos.length > 0 ? (
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
            ) : (
              <p className="text-muted-foreground text-left pl-2">No videos available</p>
            )}
          </>
        )}
        
        {location.pathname.startsWith('/explore/') && (
          <Comments videoId={id} currentUser={currentUser} />
        )}
        
        {location.pathname.startsWith('/symptoms/') && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Related Content</h2>
            <p className="text-sm text-muted-foreground text-left pl-2">
              This section shows content related to the current symptom.
            </p>
          </>
        )}
        
        {!location.pathname.startsWith('/news/') && 
         !location.pathname.startsWith('/explore/') && 
         !location.pathname.startsWith('/symptoms/') && 
         location.pathname !== '/news' && 
         location.pathname !== '/news/' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Additional Information</h2>
            <p className="text-sm text-muted-foreground text-left pl-2">
              This panel displays contextual information related to the current page.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default RightSection;
