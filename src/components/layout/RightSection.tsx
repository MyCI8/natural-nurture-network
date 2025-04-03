import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsVideos } from "@/components/news/NewsVideos";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Video } from "@/types/video";
import { Separator } from "@/components/ui/separator";
import Comments from "@/components/video/Comments";
import { Heart, MessageCircle, Share2, Bookmark, Video as VideoIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import VideoModal from "@/components/video/VideoModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoLink {
  title: string;
  url: string;
}

interface ArticleData {
  video_links?: string | null;
  video_description?: string | null;
}

interface SymptomVideoData {
  videoLinks: VideoLink[];
  videoDescription: string;
}

const RightSection = () => {
  const location = useLocation();
  const {
    id
  } = useParams();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [symptomVideos, setSymptomVideos] = useState<SymptomVideoData | null>(null);

  useEffect(() => {
    const handleSymptomVideos = (event: CustomEvent<SymptomVideoData>) => {
      if (event.detail) {
        const validatedLinks = event.detail.videoLinks?.filter(link => link && typeof link.url === 'string' && link.url.trim() !== '' && typeof link.title === 'string' && link.title.trim() !== '') || [];
        setSymptomVideos({
          ...event.detail,
          videoLinks: validatedLinks
        });
        console.log("Received symptom videos:", validatedLinks);
      }
    };
    window.addEventListener('symptom-videos' as any, handleSymptomVideos as any);
    return () => {
      window.removeEventListener('symptom-videos' as any, handleSymptomVideos as any);
    };
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith('/symptoms/')) {
      setSymptomVideos(null);
    }
  }, [location]);

  const {
    data: currentUser
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data
      } = await supabase.auth.getUser();
      return data.user;
    }
  });

  const newsArticleId = location.pathname.startsWith('/news/') ? location.pathname.split('/news/')[1] : null;
  const {
    data: articleData
  } = useQuery<ArticleData | null>({
    queryKey: ["news-article-videos", newsArticleId],
    queryFn: async () => {
      if (!newsArticleId) return null;
      const {
        data,
        error
      } = await supabase.from("news_articles").select("video_links, video_description").eq("id", newsArticleId).maybeSingle();
      if (error) {
        console.error("Error fetching article video data:", error);
        return null;
      }
      return data as ArticleData;
    },
    enabled: !!newsArticleId
  });

  const {
    data: videos
  } = useQuery<Video[]>({
    queryKey: ["news-videos-sidebar"],
    queryFn: async () => {
      console.log("Fetching latest videos for sidebar");
      const {
        data,
        error
      } = await supabase.from("videos").select("*, creator:creator_id(*), related_article_id").eq("status", "published").eq("video_type", "news").eq("show_in_latest", true).order("created_at", {
        ascending: false
      }).limit(8);
      if (error) {
        console.error("Error fetching videos:", error);
        return [];
      }
      console.log("Latest videos fetched:", data);
      return (data || []).map(video => ({
        ...video,
        related_article_id: video.related_article_id || null
      })) as Video[];
    }
  });

  const {
    data: videoDetails
  } = useQuery({
    queryKey: ['video-details', id],
    queryFn: async () => {
      if (!id || !location.pathname.startsWith('/explore/')) return null;
      const {
        data,
        error
      } = await supabase.from('videos').select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `).eq('id', id).maybeSingle();
      if (error) {
        console.error("Error fetching video details:", error);
        return null;
      }
      return data;
    },
    enabled: !!id && location.pathname.startsWith('/explore/')
  });

  const {
    data: userLikeStatus
  } = useQuery({
    queryKey: ['video-like-status', id, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !id) return false;
      const {
        data
      } = await supabase.from('video_likes').select('id').eq('video_id', id).eq('user_id', currentUser.id).maybeSingle();
      return !!data;
    },
    enabled: !!currentUser && !!id && location.pathname.startsWith('/explore/')
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) {
        throw new Error('You must be logged in to like a video');
      }
      if (userLikeStatus) {
        const {
          error
        } = await supabase.from('video_likes').delete().eq('video_id', id).eq('user_id', currentUser.id);
        if (error) throw error;
        return {
          liked: false
        };
      } else {
        const {
          error
        } = await supabase.from('video_likes').insert([{
          video_id: id,
          user_id: currentUser.id
        }]);
        if (error) throw error;
        return {
          liked: true
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['video-like-status', id, currentUser?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['video-details', id]
      });
    },
    onError: error => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update like",
        variant: "destructive"
      });
    }
  });

  const handleLike = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to like videos"
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = async () => {
    if (!videoDetails) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoDetails.title,
          text: videoDetails.description,
          url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Success",
          description: "Link copied to clipboard!"
        });
      } catch (err) {
        console.error('Error copying link:', err);
      }
    }
  };

  const handleVideoClick = (video: Video) => {
    console.log("Video clicked:", video);
    setSelectedVideo(video);
  };

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
      
      <div className="p-4 overflow-y-auto flex-1 py-[30px] h-full">
        {location.pathname.startsWith('/news/') && videoLinks.length > 0 && <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Related Videos</h2>
            <NewsVideos videoLinks={videoLinks} videoDescription={articleData?.video_description || undefined} isDesktop={true} />
          </>}
        
        {(location.pathname === '/news' || location.pathname === '/news/') && (
          <div className="h-full flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Latest Videos</h2>
            {videos && videos.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto">
                {videos.map(video => (
                  <div 
                    key={video.id} 
                    onClick={() => handleVideoClick(video)} 
                    className="cursor-pointer touch-manipulation"
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-0">
                        <AspectRatio ratio={16 / 9} className="bg-gray-100">
                          {video.thumbnail_url ? <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" /> : video.video_url && video.video_url.includes('youtube.com') && <img src={`https://img.youtube.com/vi/${video.video_url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" />}
                        </AspectRatio>
                        <div className="p-3 text-left">
                          <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(video.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-left pl-2">No videos available</p>
            )}
          </div>
        )}
        
        {location.pathname.startsWith('/explore/') && <div className="w-full">
            {videoDetails ? <div className="flex flex-col h-full">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 px-0 py-0">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-8 w-8 mr-3">
                      {videoDetails.creator?.avatar_url ? <AvatarImage src={videoDetails.creator.avatar_url} alt={videoDetails.creator.username || ''} /> : <AvatarFallback>{(videoDetails.creator?.username || '?')[0]}</AvatarFallback>}
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{videoDetails.creator?.username || 'Anonymous'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div>
                      <p className="text-sm text-left">{videoDetails.description}</p>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-2">
                      <span>{videoDetails.likes_count || 0} likes</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-0 py-0">
                      <Button variant="ghost" size="icon" className={`text-gray-500 hover:text-[#4CAF50] transition-colors ${userLikeStatus ? 'text-red-500' : ''}`} onClick={handleLike}>
                        <Heart className={`h-5 w-5 ${userLikeStatus ? 'fill-current' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#4CAF50] transition-colors">
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#4CAF50] transition-colors" onClick={handleShare}>
                        <Share2 className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#4CAF50] transition-colors">
                        <Bookmark className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Comments videoId={id} currentUser={currentUser} />
              </div> : <p className="text-muted-foreground text-left pl-2">Video details not available</p>}
          </div>}
        
        {location.pathname.startsWith('/symptoms/') && <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2 flex items-center gap-2">
              <VideoIcon className="h-5 w-5 text-primary" />
              Symptom Videos
            </h2>
            
            {symptomVideos && symptomVideos.videoLinks && symptomVideos.videoLinks.length > 0 ? <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-3 text-left pl-2">
                  {symptomVideos.videoDescription}
                </p>
                
                {symptomVideos.videoLinks.map((video, index) => <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="block touch-manipulation">
                    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-0">
                        <AspectRatio ratio={16 / 9} className="bg-gray-100 relative">
                          {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? <>
                              <img src={getYoutubeVideoId(video.url) ? `https://img.youtube.com/vi/${getYoutubeVideoId(video.url)}/hqdefault.jpg` : ''} alt={video.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </> : <div className="w-full h-full bg-accent flex items-center justify-center">
                              <span className="text-muted-foreground">Video Preview</span>
                            </div>}
                        </AspectRatio>
                        <div className="p-3 text-left">
                          <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  </a>)}
              </div> : <div className="p-4 text-center bg-accent/50 rounded-lg">
                <Alert variant="default" className="border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No videos available for this symptom.
                  </AlertDescription>
                </Alert>
              </div>}
          </>}
        
        {!location.pathname.startsWith('/news/') && !location.pathname.startsWith('/explore/') && !location.pathname.startsWith('/symptoms/') && location.pathname !== '/news' && location.pathname !== '/news/' && <>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-left pl-2">Additional Information</h2>
            <p className="text-sm text-muted-foreground text-left pl-2">
              This panel displays contextual information related to the current page.
            </p>
          </>}
      </div>

      <VideoModal video={selectedVideo} isOpen={!!selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  );
};

function getYoutubeVideoId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default RightSection;
