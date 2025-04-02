import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import RemediesSection from "./remedies/RemediesSection";
import { useRef } from "react";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
const NewsSection = () => {
  const remediesSectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
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
      }).limit(4);
      if (error) throw error;
      return data;
    }
  });
  const {
    data: videos,
    isLoading: videosLoading
  } = useQuery({
    queryKey: ["news-videos"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("videos").select("*").eq("status", "published").eq("video_type", "news").eq("show_in_latest", true).order("created_at", {
        ascending: false
      }).limit(4);
      if (error) throw error;
      console.log("News Videos fetched:", data);
      return data || [];
    }
  });
  if (isLoading) {
    return <section className="py-6 sm:py-8 lg:py-12 bg-secondary news-section">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="space-y-4 md:col-span-8">
              <h2 className="text-sm font-bold mb-3 sm:mb-4 text-left">Latest News</h2>
              {[1, 2].map(i => <Card key={i} className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="w-full md:w-1/3">
                        <Skeleton className="h-40 sm:h-48 md:h-36 w-full" />
                      </div>
                      <div className="p-3 sm:p-4 md:p-5 md:w-2/3 space-y-2 sm:space-y-3">
                        <Skeleton className="h-5 sm:h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
            
            <div className="space-y-3 sm:space-y-4 mt-6 md:mt-0 md:col-span-4">
              <h3 className="text-sm font-bold mb-3 sm:mb-4 text-left">Latest Videos</h3>
              <div className="grid grid-cols-1 gap-4">
                {[1, 2].map(i => <Card key={i} className="overflow-hidden shadow-sm">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-video w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </div>
      </section>;
  }
  return <section className="py-6 sm:py-8 lg:py-12 bg-secondary news-section">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="space-y-4 sm:space-y-6 md:col-span-8">
            <h2 className="text-sm font-bold mb-3 sm:mb-4 text-left text-text-dark">Latest News</h2>
            {newsItems?.map((item, index) => <Link to={`/news/${item.id}`} key={item.id}>
                <Card className={`overflow-hidden border-0 ${index !== newsItems.length - 1 ? 'border-b border-border dark:border-dm-mist/50' : ''} animate-fadeIn hover:shadow-none transition-shadow duration-200`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="w-full md:w-1/3">
                        <AspectRatio ratio={16 / 9} className="bg-gray-100">
                          <img src={item.image_url || "/placeholder.svg"} alt={item.thumbnail_description || ""} className="w-full h-full object-cover" loading="lazy" />
                        </AspectRatio>
                      </div>
                      <div className="p-3 sm:p-4 md:p-5 md:w-2/3">
                        <h3 className="text-base sm:text-lg font-semibold text-primary dark:text-primary mb-2 text-left line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-primary dark:text-primary line-clamp-2 text-left">
                          {item.summary}
                        </p>
                        <div className="mt-2 sm:mt-3 text-xs text-primary font-medium text-left">
                          Read more
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>)}
            {newsItems?.length === 0 && <div className="text-center py-8 text-muted-foreground">
                No news articles available
              </div>}
            
            <div ref={remediesSectionRef} className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border">
              <RemediesSection inNewsSection />
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4 mt-6 md:mt-0 md:col-span-4">
            <h3 className="text-sm font-bold mb-3 sm:mb-4 text-left text-primary">Latest Videos</h3>
            <div className="grid grid-cols-1 gap-4">
              {videos?.map((video, index) => <Link to={`/news/videos/${video.id}`} key={video.id}>
                  <Card className={`overflow-hidden border-0 ${index !== videos.length - 1 ? 'border-b border-border dark:border-dm-mist/50' : ''} hover:shadow-none transition-shadow duration-200`}>
                    <CardContent className="p-0">
                      <AspectRatio ratio={16 / 9} className="bg-gray-100">
                        {video.thumbnail_url ? <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" loading="lazy" /> : video.video_url && video.video_url.includes('youtube.com') && <img src={`https://img.youtube.com/vi/${getYoutubeVideoId(video.video_url)}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover" loading="lazy" />}
                      </AspectRatio>
                      <div className="p-3 text-left">
                        <h4 className="font-medium text-xs sm:text-sm line-clamp-2 text-primary dark:text-primary">{video.title}</h4>
                        <p className="text-xs text-primary dark:text-primary line-clamp-2">{video.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>)}
              {videos?.length === 0 && <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  No videos available
                </div>}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
const getYoutubeVideoId = url => {
  if (!url) return '';
  let videoId = '';
  try {
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
  }
  return videoId;
};
export default NewsSection;