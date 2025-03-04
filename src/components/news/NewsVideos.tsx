
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
  url: string;
}

interface NewsVideosProps { 
  videoLinks: VideoLink[]; 
  videoDescription?: string;
  isMobile: boolean;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
const getYouTubeVideoId = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;
  
  // Handle various YouTube URL formats
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  
  // Return the video ID (7th capturing group) if it has exactly 11 characters
  return (match && match[7] && match[7].length === 11) ? match[7] : null;
};

/**
 * Checks if a URL is a valid YouTube URL by attempting to extract a video ID
 */
const isValidYouTubeUrl = (url: string): boolean => {
  return !!getYouTubeVideoId(url);
};

/**
 * NewsVideos component - Displays YouTube videos in either desktop or mobile mode
 */
export const NewsVideos = ({ videoLinks, videoDescription, isMobile }: NewsVideosProps) => {
  const [validVideoLinks, setValidVideoLinks] = useState<VideoLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter valid YouTube links on component mount and when props change
  useEffect(() => {
    setIsLoading(true);
    
    if (!Array.isArray(videoLinks) || videoLinks.length === 0) {
      console.log("NewsVideos: No valid video links array provided");
      setValidVideoLinks([]);
      setIsLoading(false);
      return;
    }

    // Filter out invalid links and non-YouTube URLs
    const filteredLinks = videoLinks.filter(link => {
      // Validate link object structure
      if (!link || !link.url || typeof link.url !== "string") {
        console.log("NewsVideos: Filtered out malformed link:", link);
        return false;
      }
      
      // Validate that it's a YouTube URL
      if (!isValidYouTubeUrl(link.url)) {
        console.log("NewsVideos: Filtered out non-YouTube URL:", link.url);
        return false;
      }
      
      return true;
    });
    
    console.log(
      `NewsVideos: Filtered ${filteredLinks.length} valid YouTube videos from ${videoLinks.length} links`,
      "Mode:", isMobile ? "mobile" : "desktop"
    );
    
    setValidVideoLinks(filteredLinks);
    setIsLoading(false);
  }, [videoLinks, isMobile]);
  
  /**
   * Generates a YouTube embed URL with optional parameters
   */
  const getEmbedUrl = (videoId: string, autoplay = false, mute = true): string => {
    const params = new URLSearchParams();
    
    if (autoplay) params.append("autoplay", "1");
    if (mute) params.append("mute", "1");
    
    // Add additional parameters for better integration
    params.append("enablejsapi", "1");
    params.append("origin", "https://preview-natural-nurture-network.lovable.app");
    params.append("rel", "0"); // Don't show related videos at the end
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
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

  // No videos available state
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

  /**
   * Renders a list of videos for desktop view
   */
  const renderDesktopVideos = () => {
    console.log("NewsVideos: Rendering desktop videos with", validVideoLinks.length, "valid links");
    
    return (
      <div className="space-y-6 w-full">
        {validVideoLinks.map((video, index) => {
          const videoId = getYouTubeVideoId(video.url);
          
          if (!videoId) {
            console.error("NewsVideos: Failed to extract video ID for URL:", video.url);
            return <div key={index} className="text-red-500 mb-2">Invalid Video ID: {video.url}</div>;
          }
          
          return (
            <div key={index} className="mb-6 group hover:opacity-95 transition-opacity">
              <div className="relative aspect-video w-full overflow-visible rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                <iframe
                  src={getEmbedUrl(videoId)}
                  title={video.title || `Video ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0 z-10"
                  loading="lazy"
                  onError={(e) => console.error("NewsVideos: Video iframe error for", video.url, ":", e)}
                  onLoad={() => console.log("NewsVideos: Video iframe loaded for", video.title || `Video ${index + 1}`)}
                />
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

  /**
   * Renders a carousel of videos for mobile view
   */
  const renderMobileCarousel = () => {
    console.log("NewsVideos: Rendering mobile carousel with", validVideoLinks.length, "valid links");
    
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {validVideoLinks.map((video, index) => {
            const videoId = getYouTubeVideoId(video.url);
            
            if (!videoId) {
              console.error("NewsVideos: Failed to extract video ID for URL:", video.url);
              return null;
            }
            
            return (
              <CarouselItem key={index} className="pl-1 md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <div className="relative aspect-video w-full max-w-[300px] mx-auto overflow-visible rounded-lg shadow-md">
                    <iframe
                      src={getEmbedUrl(videoId, true, true)} // Autoplay and mute for carousel
                      title={video.title || `Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full border-0 z-10"
                      loading="lazy"
                      onError={(e) => console.error("NewsVideos: Mobile video iframe error for", video.url, ":", e)}
                      onLoad={() => console.log("NewsVideos: Mobile video iframe loaded for", video.title || `Video ${index + 1}`)}
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
        <p className="text-text-light mb-4 text-sm">{videoDescription}</p>
      )}
      
      {isMobile ? renderMobileCarousel() : renderDesktopVideos()}
    </aside>
  );
};
