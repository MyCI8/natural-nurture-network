import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import VideoPlayer from '@/components/video/VideoPlayer';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/types/video';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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

  const handleVideoClick = (index: number) => {
    setActiveVideoIndex(index);
    setIsFullscreen(true);
  };

  const handleClose = () => {
    setIsFullscreen(false);
  };

  const handleNext = () => {
    if (activeVideoIndex !== null && videoLinks.length > 0) {
      setActiveVideoIndex((prev) => (prev === null ? 0 : (prev + 1) % videoLinks.length));
    }
  };

  const handlePrevious = () => {
    if (activeVideoIndex !== null && videoLinks.length > 0) {
      setActiveVideoIndex((prev) => (prev === null ? 0 : (prev - 1 + videoLinks.length) % videoLinks.length));
    }
  };

  const getYoutubeVideoId = (url: string) => {
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

  return (
    <div className="space-y-4">
      {videoDescription && (
        <p className="text-sm text-muted-foreground mb-4 text-left pl-2">{videoDescription}</p>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {videoLinks.map((videoLink, index) => (
          <Card 
            key={index} 
            className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleVideoClick(index)}
          >
            <CardContent className="p-0">
              <AspectRatio ratio={16/9} className="bg-gray-100 relative">
                {videoLink.url.includes('youtube.com') || videoLink.url.includes('youtu.be') ? (
                  <img
                    src={`https://img.youtube.com/vi/${getYoutubeVideoId(videoLink.url)}/hqdefault.jpg`}
                    alt={videoLink.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span>Video Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                    <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </AspectRatio>
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-2 text-left pl-2">{videoLink.title}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isFullscreen && activeVideoIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 text-white bg-black/20 hover:bg-black/40 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
          
          {videoLinks.length > 1 && (
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
          
          <div className="w-full max-w-5xl mx-auto">
            <div className="aspect-video bg-black">
              {videoLinks[activeVideoIndex].url.includes('youtube.com') || videoLinks[activeVideoIndex].url.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoLinks[activeVideoIndex].url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <VideoPlayer
                  video={createVideoObject(videoLinks[activeVideoIndex])}
                  autoPlay={true}
                  showControls={true}
                  globalAudioEnabled={true}
                  isFullscreen={true}
                />
              )}
            </div>
            
            {videoLinks[activeVideoIndex].title && (
              <div className="bg-black/50 p-4 mt-2">
                <h3 className="text-white text-lg font-medium text-left">{videoLinks[activeVideoIndex].title}</h3>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
