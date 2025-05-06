
import React from 'react';
import { cn } from '@/lib/utils';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video, ProductLink } from '@/types/video';
import { getYouTubeVideoId } from './utils/videoPlayerUtils';
import ProductLinkCard from './ProductLinkCard';

interface YouTubePlayerProps {
  video: Video;
  productLinks?: ProductLink[];
  autoPlay?: boolean;
  isMuted?: boolean;
  showControls?: boolean;
  isFullscreen?: boolean;
  className?: string;
  visibleProductLink: string | null;
  onClick?: () => void;
  onClose?: () => void;
  toggleProductLink: (linkId: string) => void;
  useAspectRatio?: boolean;
  feedAspectRatio?: number;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  video,
  productLinks = [],
  autoPlay = true,
  isMuted = true,
  showControls = false,
  isFullscreen = false,
  className,
  visibleProductLink,
  onClick,
  onClose,
  toggleProductLink,
  useAspectRatio = true,
  feedAspectRatio = 4/5
}) => {
  const youtubeId = getYoutubeVideoId(video.video_url || '');
  
  if (!youtubeId) {
    return <div className="p-4 bg-black text-white">Invalid YouTube URL</div>;
  }
  
  if (isFullscreen) {
    return (
      <div 
        className={cn(
          "relative overflow-hidden flex items-center justify-center bg-black", 
          "h-full w-full",
          className
        )}
        onClick={() => onClick?.()}
      >
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2 right-2 z-20 text-white bg-black/20 hover:bg-black/40 h-6 w-6 p-0.5 rounded-full touch-manipulation"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&playsinline=1&rel=0&showinfo=0&modestbranding=1&color=white&iv_load_policy=3`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        ></iframe>
        
        {productLinks.length > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                toggleProductLink(productLinks[0].id);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="text-xs">Products</span>
            </Button>
          </div>
        )}

        {productLinks.map((link) => (
          <div key={link.id} className={cn(
            "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
            visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
          )}>
            <ProductLinkCard 
              link={link} 
              onClose={() => toggleProductLink(link.id)} 
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden bg-black", className)}
      onClick={() => onClick?.()}
    >
      {useAspectRatio ? (
        <div className="w-full" style={{ aspectRatio: feedAspectRatio }}>
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${showControls ? 1 : 0}&playsinline=1&rel=0&showinfo=0&modestbranding=1&color=white&iv_load_policy=3`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          ></iframe>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=${showControls ? 1 : 0}&playsinline=1&rel=0&showinfo=0&modestbranding=1&color=white&iv_load_policy=3`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
        ></iframe>
      )}

      {productLinks.length > 0 && (
        <>
          <div className="absolute top-3 left-3 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                toggleProductLink(productLinks[0].id);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              <span className="text-xs">Products</span>
            </Button>
          </div>

          {productLinks.map((link) => (
            <div key={link.id} className={cn(
              "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
              visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
            )}>
              <ProductLinkCard 
                link={link} 
                onClose={() => toggleProductLink(link.id)} 
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default YouTubePlayer;
