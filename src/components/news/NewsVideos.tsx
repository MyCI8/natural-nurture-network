
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface VideoLink { 
  title: string; 
  url: string 
}

interface NewsVideosProps { 
  videoLinks: VideoLink[]; 
  videoDescription?: string;
  viewMode?: "mobile" | "desktop";
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string) => {
  if (!url || typeof url !== 'string') return null;
  
  // Handle various YouTube URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Check if URL is a valid YouTube URL
const isValidYouTubeUrl = (url: string) => {
  return !!getYouTubeVideoId(url);
};

export const NewsVideos = ({ videoLinks, videoDescription, viewMode = "desktop" }: NewsVideosProps) => {
  const [validVideoLinks, setValidVideoLinks] = useState<VideoLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log("NewsVideos rendering in", viewMode, "mode with", videoLinks?.length || 0, "links");

  // Filter valid YouTube links on component mount and when videoLinks change
  useEffect(() => {
    setIsLoading(true);
    if (!videoLinks || !Array.isArray(videoLinks)) {
      console.log("No valid video links provided");
      setValidVideoLinks([]);
      setIsLoading(false);
      return;
    }

    const filteredLinks = videoLinks.filter(link => {
      if (!link || !link.url || typeof link.url !== 'string') {
        return false;
      }
      
      if (!isValidYouTubeUrl(link.url)) {
        return false;
      }
      
      return true;
    });
    
    console.log(`Filtered ${filteredLinks.length} valid YouTube videos from ${videoLinks.length} links for ${viewMode} view`);
    setValidVideoLinks(filteredLinks);
    setIsLoading(false);
  }, [videoLinks, viewMode]);
  
  // Generate YouTube embed URL with autoplay and mute parameters for mobile carousel
  const getEmbedUrl = (videoId: string, autoplay: boolean = false, mute: boolean = true) => {
    let url = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams();
    
    if (autoplay) params.append('autoplay', '1');
    if (mute) params.append('mute', '1');
    params.append('enablejsapi', '1');
    params.append('origin', window.location.origin);
    params.append('rel', '0'); // Don't show related videos
    
    return `${url}?${params.toString()}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <aside className="w-full text-left">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        {videoDescription && (
          <p className="text-text-light mb-4 text-sm">{videoDescription}</p>
        )}
        <div className="flex items-center justify-center h-32 border rounded-lg bg-secondary/50">
          <p className="text-text-light">Loading videos...</p>
        </div>
      </aside>
    );
  }

  // Render "No videos available" when no valid videos exist
  if (validVideoLinks.length === 0) {
    return (
      <aside className="w-full text-left">
        <h2 className="text-xl font-semibold mb-4">Videos</h2>
        {videoDescription && (
          <p className="text-text-light mb-4 text-sm">{videoDescription}</p>
        )}
        <div className="flex items-center justify-center h-32 border rounded-lg bg-secondary/50">
          <p className="text-text-light">No videos available</p>
        </div>
      </aside>
    );
  }

  // Desktop layout
  const renderDesktopVideos = () => {
    console.log("Rendering desktop videos with", validVideoLinks.length, "valid links");
    return (
      <div className="space-y-6">
        {validVideoLinks.map((video: VideoLink, index: number) => {
          const videoId = getYouTubeVideoId(video.url);
          if (!videoId) {
            console.log("No video ID extracted for URL:", video.url);
            return null;
          }
          
          return (
            <div key={index} className="mb-6 group hover:opacity-95 transition-opacity">
              <div className="w-full">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer">
                  <iframe
                    src={getEmbedUrl(videoId)}
                    title={video.title || `Video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
              <h3 className="font-medium text-base line-clamp-2 mt-2 group-hover:text-primary transition-colors text-left">
                {video.title || `Video ${index + 1}`}
              </h3>
            </div>
          );
        })}
      </div>
    );
  };

  // Mobile carousel layout
  const renderMobileCarousel = () => {
    console.log("Rendering mobile carousel with", validVideoLinks.length, "valid links");
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {validVideoLinks.map((video: VideoLink, index: number) => {
            const videoId = getYouTubeVideoId(video.url);
            if (!videoId) return null;
            
            return (
              <CarouselItem key={index} className="pl-1 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div className="relative aspect-video w-full max-w-[300px] mx-auto overflow-hidden rounded-lg shadow-md">
                    <iframe
                      src={getEmbedUrl(videoId, true, true)}
                      title={video.title || `Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-medium text-sm text-center line-clamp-1 mt-2">
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
    );
  };

  return (
    <aside className="w-full text-left">
      <h2 className="text-xl font-semibold mb-4">
        Videos {validVideoLinks.length > 0 ? `(${validVideoLinks.length})` : ''}
      </h2>
      {videoDescription && (
        <p className="text-text-light mb-4 text-sm">
          {videoDescription}
        </p>
      )}
      
      {viewMode === "mobile" ? renderMobileCarousel() : renderDesktopVideos()}
    </aside>
  );
};
