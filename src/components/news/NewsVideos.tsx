
import { useEffect, useState, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VideoLink {
  title: string;
  url: string;
}

interface NewsVideosProps {
  videoLinks: VideoLink[];
  videoDescription?: string;
  isDesktop: boolean;
}

const getYouTubeVideoId = (url: string) => {
  if (!url || typeof url !== 'string') return null;
  
  // Handle various YouTube URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

export const NewsVideos = ({ videoLinks, videoDescription, isDesktop }: NewsVideosProps) => {
  const [validVideoLinks, setValidVideoLinks] = useState<VideoLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  console.log("NewsVideos rendering. isDesktop:", isDesktop, "videoLinks:", videoLinks, "windowWidth:", window.innerWidth);

  useEffect(() => {
    setIsLoading(true);
    
    if (!Array.isArray(videoLinks)) {
      console.log("No valid video links provided");
      setValidVideoLinks([]);
      setIsLoading(false);
      return;
    }

    const filteredLinks = videoLinks.filter(link => {
      if (!link || !link.url || typeof link.url !== 'string') {
        console.log("Filtered out link due to missing or invalid URL:", link);
        return false;
      }
      
      const videoId = getYouTubeVideoId(link.url);
      if (!videoId) {
        console.log("Filtered out non-YouTube URL:", link.url);
        return false;
      }
      
      return true;
    });
    
    console.log(`Filtered ${filteredLinks.length} valid YouTube videos from ${videoLinks.length} links`);
    setValidVideoLinks(filteredLinks);
    setIsLoading(false);
  }, [videoLinks]);

  const getEmbedUrl = (videoId: string, autoplay = false, mute = true) => {
    const params = new URLSearchParams();
    if (autoplay) params.append("autoplay", "1");
    if (mute) params.append("mute", "1");
    params.append("enablejsapi", "1");
    params.append("origin", window.location.origin);
    params.append("rel", "0");
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <aside className="w-full text-left">
        <h2 className="text-xl font-semibold mb-2">Videos</h2>
        {videoDescription && (
          <p className="text-text-light mb-2 text-sm">{videoDescription}</p>
        )}
        <div className="flex items-center justify-center h-32 border rounded-lg bg-secondary/50">
          <p className="text-text-light">Loading videos...</p>
        </div>
      </aside>
    );
  }

  if (validVideoLinks.length === 0) {
    return (
      <aside className="w-full text-left">
        <h2 className="text-xl font-semibold mb-2">Videos</h2>
        {videoDescription && (
          <p className="text-text-light mb-2 text-sm">{videoDescription}</p>
        )}
        <div className="flex items-center justify-center h-32 border rounded-lg bg-secondary/50">
          <p className="text-text-light">No videos available</p>
        </div>
      </aside>
    );
  }

  return (
    <aside ref={videoContainerRef} className="w-full text-left sticky top-4">
      <h2 className="text-xl font-semibold mb-2">Videos</h2>
      {videoDescription && (
        <p className="text-text-light mb-2 text-sm">{videoDescription}</p>
      )}
      
      {isDesktop ? (
        <div className="space-y-4">
          {validVideoLinks.map((video, index) => {
            const videoId = getYouTubeVideoId(video.url);
            if (!videoId) {
              console.log("No video ID extracted for URL:", video.url);
              return null;
            }
            
            return (
              <div key={index} className="group hover:opacity-95 transition-opacity mb-4">
                <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg video-thumbnail">
                  <iframe
                    src={getEmbedUrl(videoId)}
                    title={video.title || `Video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0 z-10"
                    loading="lazy"
                    onError={(e) => console.error(`Failed to load video: ${video.url}`, e)}
                    onLoad={() => console.log(`Successfully loaded video: ${video.url}`)}
                  />
                </div>
                <h3 className="font-medium text-base line-clamp-2 mt-1 group-hover:text-primary transition-colors video-title">
                  {video.title || `Video ${index + 1}`}
                </h3>
              </div>
            );
          })}
        </div>
      ) : (
        <Carousel className="w-full">
          <CarouselContent>
            {validVideoLinks.map((video, index) => {
              const videoId = getYouTubeVideoId(video.url);
              if (!videoId) return null;
              
              return (
                <CarouselItem key={index} className="pl-1">
                  <div className="p-1">
                    <div className="relative aspect-video w-full max-w-[200px] mx-auto overflow-hidden rounded-lg shadow-md video-thumbnail-mobile">
                      <iframe
                        src={getEmbedUrl(videoId, true, true)}
                        title={video.title || `Video ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full border-0 z-10"
                        loading="lazy"
                        onError={(e) => console.error(`Failed to load video in carousel: ${video.url}`, e)}
                        onLoad={() => console.log(`Successfully loaded video in carousel: ${video.url}`)}
                      />
                    </div>
                    <h3 className="font-medium text-sm text-center line-clamp-1 mt-1 video-title">
                      {video.title || `Video ${index + 1}`}
                    </h3>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex justify-center mt-2">
            <CarouselPrevious className="relative static mr-2 h-8 w-8" />
            <CarouselNext className="relative static ml-2 h-8 w-8" />
          </div>
        </Carousel>
      )}
    </aside>
  );
};
