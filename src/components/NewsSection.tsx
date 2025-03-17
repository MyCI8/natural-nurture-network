import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import RemediesSection from "./remedies/RemediesSection";
import { useRef, useEffect, useState } from "react";

const NewsSection = () => {
  const remediesSectionRef = useRef<HTMLDivElement>(null);
  const [separatorHeight, setSeparatorHeight] = useState("40%");
  
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["news-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "published")
        .eq("video_type", "news")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      console.log("News Videos fetched:", data);
      return data;
    },
  });

  useEffect(() => {
    const updateSeparatorHeight = () => {
      if (remediesSectionRef.current) {
        const newsSection = document.querySelector('section.news-section');
        if (newsSection) {
          const sectionTop = newsSection.getBoundingClientRect().top;
          const remediesTop = remediesSectionRef.current.getBoundingClientRect().top;
          const headerHeight = 80;
          
          const height = remediesTop - sectionTop - headerHeight;
          if (height > 0) {
            setSeparatorHeight(`${height}px`);
          }
        }
      }
    };
    
    updateSeparatorHeight();
    window.addEventListener('resize', updateSeparatorHeight);
    
    return () => window.removeEventListener('resize', updateSeparatorHeight);
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-secondary news-section">
        <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold mb-4">Latest News</h2>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="w-full md:w-1/3">
                        <Skeleton className="h-48 md:h-36 w-full" />
                      </div>
                      <div className="p-4 md:p-5 md:w-2/3 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="hidden lg:block lg:col-span-1 lg:relative">
              <div className="absolute left-0 top-[80px] w-px bg-border opacity-50" style={{ 
                height: '300px',
                maxHeight: '70%'
              }}></div>
            </div>
            
            <div className="col-span-1 space-y-4 px-0 lg:px-4">
              <h3 className="text-2xl font-bold mb-4">Latest Videos</h3>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden shadow-sm">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-secondary news-section">
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-left">Latest News</h2>
            {newsItems?.map((item) => (
              <Link to={`/news/${item.id}`} key={item.id}>
                <Card className="overflow-hidden shadow-sm animate-fadeIn hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="w-full md:w-1/3">
                        <AspectRatio ratio={16/9} className="bg-gray-100">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.thumbnail_description || ""}
                            className="w-full h-full object-cover"
                          />
                        </AspectRatio>
                      </div>
                      <div className="p-4 md:p-5 md:w-2/3">
                        <h3 className="text-lg font-semibold text-text mb-2 text-left line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-text-light line-clamp-2 text-left">
                          {item.summary}
                        </p>
                        <div className="mt-3 text-xs text-primary font-medium text-left">
                          Read more
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {newsItems?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No news articles available
              </div>
            )}
            
            <div ref={remediesSectionRef} className="pt-8 mt-8 border-t border-border">
              <RemediesSection inNewsSection />
            </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-1 lg:relative">
            <div className="absolute left-0 top-[80px] w-px bg-border opacity-50" style={{ 
              height: '300px',
              maxHeight: '70%'
            }}></div>
          </div>
          
          <div className="col-span-1 space-y-4 px-0 lg:px-4">
            <h3 className="text-2xl font-bold mb-4 text-left">Latest Videos</h3>
            {videos?.map((video) => (
              <Link to={`/news/videos/${video.id}`} key={video.id}>
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
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
                            src={`https://img.youtube.com/vi/${getYoutubeVideoId(video.video_url)}/hqdefault.jpg`}
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
            {videos?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No videos available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const getYoutubeVideoId = (url) => {
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
