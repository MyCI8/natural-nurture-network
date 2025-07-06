
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VideoPlayer from '@/components/video/VideoPlayer';
import { ChevronLeft, ChevronRight, X, Video as VideoIcon } from 'lucide-react';
import { Video } from '@/types/video';
import { Swipeable } from '@/components/ui/swipeable';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoLink {
  title: string;
  url: string;
}

interface NewsVideosProps {
  videoLinks: VideoLink[];
  videoDescription?: string;
  isDesktop?: boolean;
}

export const NewsVideos = ({ videoLinks, videoDescription, isDesktop = false }: NewsVideosProps) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter out invalid video links
  const validVideoLinks = videoLinks.filter(link => 
    link && 
    typeof link.url === 'string' && 
    link.url.trim() !== '' &&
    typeof link.title === 'string'
  );

  const handleVideoClick = (index: number) => {
    setActiveVideoIndex(index);
    setIsFullscreen(true);
  };

  const handleClose = () => {
    setIsFullscreen(false);
  };

  const handleNext = () => {
    if (activeVideoIndex !== null && validVideoLinks.length > 0) {
      setActiveVideoIndex((prev) => (prev === null ? 0 : (prev + 1) % validVideoLinks.length));
    }
  };

  const handlePrevious = () => {
    if (activeVideoIndex !== null && validVideoLinks.length > 0) {
      setActiveVideoIndex((prev) => (prev === null ? 0 : (prev - 1 + validVideoLinks.length) % validVideoLinks.length));
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  const getYoutubeVideoId = (url: string) => {
    if (!url) {return null;}
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const createVideoObject = (videoLink: VideoLink): Video => {
    return {
      id: Math.random().toString(),
      title: videoLink.title,
      description: null,
      video_url: videoLink.url,
      thumbnail_url: videoLink.url.includes('youtube.com') || videoLink.url.includes('youtu.be')
        ? `https://img.youtube.com/vi/${getYoutubeVideoId(videoLink.url)}/hqdefault.jpg`
        : null,
      creator_id: null,
      status: 'published',
      views_count: 0,
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      video_type: 'news',
      related_article_id: null
    };
  };

  if (validVideoLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {videoDescription && (
        <p className="text-sm text-muted-foreground mb-4 text-left pl-2">{videoDescription}</p>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {validVideoLinks.map((videoLink, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer touch-manipulation"
            onClick={() => handleVideoClick(index)}
          >
            <CardContent className="p-0">
              <AspectRatio ratio={16/9} className="bg-muted relative">
                {videoLink.url.includes('youtube.com') || videoLink.url.includes('youtu.be') ? (
                  <img
                    src={`https://img.youtube.com/vi/${getYoutubeVideoId(videoLink.url)}/hqdefault.jpg`}
                    alt={videoLink.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center">
                    <VideoIcon className="h-8 w-8 text-muted-foreground opacity-70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </AspectRatio>
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-2 text-left">{videoLink.title}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isFullscreen && activeVideoIndex !== null && (
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen} modal>
          <DialogContent className="p-0 bg-black border-none max-w-6xl w-[95vw] h-[95vh] overflow-hidden rounded-lg" onPointerDownOutside={handleClose}>
            <Swipeable onSwipe={handleSwipe} className="h-full w-full relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 text-white bg-black/20 hover:bg-black/40 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
              
              {validVideoLinks.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/40 rounded-full"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              <div className="w-full h-full flex flex-col justify-center items-center">
                <div className="w-full max-w-5xl h-full flex flex-col justify-center">
                  <div className="aspect-video w-full max-h-[80vh] bg-black">
                    {validVideoLinks[activeVideoIndex].url.includes('youtube.com') || validVideoLinks[activeVideoIndex].url.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(validVideoLinks[activeVideoIndex].url)}?autoplay=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <VideoPlayer
                        video={createVideoObject(validVideoLinks[activeVideoIndex])}
                        autoPlay={true}
                        showControls={true}
                        globalAudioEnabled={true}
                        isFullscreen={true}
                      />
                    )}
                  </div>
                  
                  {validVideoLinks[activeVideoIndex].title && (
                    <div className="bg-black/50 p-4 mt-2">
                      <h3 className="text-white text-lg font-medium text-left">{validVideoLinks[activeVideoIndex].title}</h3>
                    </div>
                  )}
                </div>
              </div>
            </Swipeable>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
