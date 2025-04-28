
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, MessageCircle, Share2, ShoppingCart, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Video, ProductLink } from '@/types/video';
import VideoPlayer from './VideoPlayer';

interface FullscreenVideoFeedProps {
  video: Video & { creator: any };
  onClose: () => void;
  onSwipe: (direction: 'up' | 'down') => void;
  productLinks: ProductLink[];
  onLike?: () => void;
  isLiked?: boolean;
  onComment?: () => void;
  onShare?: () => void;
  onProductClick?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const FullscreenVideoFeed: React.FC<FullscreenVideoFeedProps> = ({
  video,
  onClose,
  onSwipe,
  productLinks,
  onLike,
  isLiked,
  onComment,
  onShare,
  onProductClick,
  isFirst,
  isLast
}) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const swipeStartY = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const swipeThreshold = 80; // Minimum distance to trigger swipe
  const touchStartTimeRef = useRef<number>(0);
  
  // Track video progress
  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration || 1;
        const calculatedProgress = (currentTime / duration) * 100;
        setProgress(calculatedProgress);
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateProgress);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartY.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartY.current) return;
    
    const currentY = e.touches[0].clientY;
    const diffY = swipeStartY.current - currentY;
    const swipeDirection = diffY > 0 ? 'up' : 'down';
    
    // Apply resistance at the edges
    if ((swipeDirection === 'up' && isLast) || (swipeDirection === 'down' && isFirst)) {
      // Add resistance by reducing movement
      const element = e.currentTarget;
      const translateY = Math.abs(diffY) > swipeThreshold 
        ? diffY / 3 // Apply resistance
        : 0;
      
      element.style.transform = `translateY(${-translateY}px)`;
      element.style.transition = 'none';
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeStartY.current) return;
    
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTimeRef.current;
    const endY = e.changedTouches[0].clientY;
    const diffY = swipeStartY.current - endY;
    const isFastSwipe = touchDuration < 250 && Math.abs(diffY) > swipeThreshold / 2;
    
    // Reset any transform we applied during touchmove
    e.currentTarget.style.transform = '';
    e.currentTarget.style.transition = '';
    
    if (Math.abs(diffY) > swipeThreshold || isFastSwipe) {
      setIsTransitioning(true);
      if (diffY > 0 && !isLast) {
        // Up swipe - Next video
        onSwipe('up');
      } else if (diffY < 0 && !isFirst) {
        // Down swipe - Previous video
        onSwipe('down');
      }
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    swipeStartY.current = null;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getSwipeTransitionClass = () => {
    if (!isTransitioning) return '';
    return 'transition-transform duration-300 ease-in-out';
  };

  return (
    <div 
      className="fixed inset-0 bg-black touch-manipulation z-50 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`relative w-full h-full ${getSwipeTransitionClass()}`}>
        <VideoPlayer
          video={video}
          autoPlay={true}
          showControls={false}
          className="w-full h-full"
          productLinks={[]}
          objectFit="contain"
          isMuted={isMuted}
          ref={videoRef}
        />

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <Progress className="h-1 bg-gray-700" value={progress} />
        </div>

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-white">
              {video.creator?.avatar_url ? (
                <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
              ) : (
                <AvatarFallback>{video.creator?.username?.[0] || '?'}</AvatarFallback>
              )}
            </Avatar>
            <span className="text-white font-semibold text-sm">
              {video.creator?.username || 'Anonymous'}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white bg-black/20 hover:bg-black/40 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Bottom Right Controls */}
        <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLike}
            className={`p-0 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 ${
              isLiked ? 'text-red-500' : 'text-white'
            }`}
          >
            <Heart className={`h-7 w-7 ${isLiked ? 'fill-current' : ''}`} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onComment}
            className="p-0 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
          >
            <MessageCircle className="h-7 w-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="p-0 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
          >
            <Share2 className="h-7 w-7" />
          </Button>

          {productLinks.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onProductClick}
              className="p-0 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
            >
              <ShoppingCart className="h-7 w-7" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="p-0 h-12 w-12 rounded-full bg-black/20 hover:bg-black/40 text-white"
          >
            {isMuted ? (
              <VolumeX className="h-7 w-7" />
            ) : (
              <Volume2 className="h-7 w-7" />
            )}
          </Button>
        </div>

        {/* Video description */}
        <div className="absolute bottom-32 left-4 right-20 text-white">
          <p className="text-sm">{video.description}</p>
        </div>
      </div>
    </div>
  );
};

export default FullscreenVideoFeed;
