
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const NewsVideos = ({ videoLinks, videoDescription }: NewsVideosProps) => {
  const isMobile = useIsMobile();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!videoLinks?.length && !videoDescription) {
    console.log("No video links or description provided");
    return null;
  }

  console.log("Rendering videos:", videoLinks.length); // Debug log

  const handleVideoClick = (videoId: string) => {
    if (activeVideo === videoId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveVideo(videoId);
      setIsPlaying(true);
    }
  };
  
  // Generate YouTube embed URL with autoplay and mute parameters for mobile carousel
  const getEmbedUrl = (videoId: string, autoplay: boolean = false, mute: boolean = true) => {
    let url = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams();
    
    if (autoplay) params.append('autoplay', '1');
    if (mute) params.append('mute', '1');
    params.append('enablejsapi', '1');
    
    return `${url}?${params.toString()}`;
  };

  // Desktop layout
  const renderDesktopVideos = () => (
    <div className="space-y-6">
      {Array.isArray(videoLinks) && videoLinks.map((video: VideoLink, index: number) => {
        const videoId = getYouTubeVideoId(video.url);
        if (!videoId) {
          console.log("Invalid video URL:", video.url);
          return null;
        }
        
        return (
          <div key={index} className="mb-6 group">
            <div className="w-full">
              <div className="relative aspect-video w-full sm:w-[220px] md:w-[260px] lg:w-[320px] max-w-full overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer">
                <iframe
                  src={getEmbedUrl(videoId)}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full border-0"
                />
              </div>
            </div>
            <h3 className="font-medium text-base sm:text-base md:text-lg lg:text-xl text-text line-clamp-2 mt-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </div>
        );
      })}
    </div>
  );

  // Mobile carousel layout
  const renderMobileCarousel = () => (
    <Carousel className="w-full">
      <CarouselContent>
        {Array.isArray(videoLinks) && videoLinks.map((video: VideoLink, index: number) => {
          const videoId = getYouTubeVideoId(video.url);
          if (!videoId) return null;
          
          return (
            <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <div className="relative aspect-video w-full max-w-[250px] mx-auto overflow-hidden rounded-lg shadow-md">
                  <iframe
                    src={getEmbedUrl(videoId, true)}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full border-0"
                  />
                </div>
                <h3 className="font-medium text-sm text-center line-clamp-1 mt-2">
                  {video.title}
                </h3>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center mt-4">
        <CarouselPrevious className="relative static mr-2 h-8 w-8" />
        <CarouselNext className="relative static ml-2 h-8 w-8" />
      </div>
    </Carousel>
  );

  return (
    <aside className={`${isMobile ? '' : 'lg:sticky lg:top-8'} w-full`}>
      <h2 className="text-xl sm:text-xl md:text-xl lg:text-2xl font-semibold mb-4">
        Videos
      </h2>
      {videoDescription && (
        <p className="text-text-light mb-6 text-xs sm:text-xs md:text-sm lg:text-base">
          {videoDescription}
        </p>
      )}
      
      {isMobile ? renderMobileCarousel() : renderDesktopVideos()}
      
      {videoLinks.length === 0 && (
        <div className="flex items-center justify-center h-32 border rounded-lg bg-secondary/50">
          <p className="text-text-light">No videos available</p>
        </div>
      )}
    </aside>
  );
};
