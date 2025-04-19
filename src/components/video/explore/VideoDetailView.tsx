
import React from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import { ProductLink } from '@/types/video';
import { X, Volume2, VolumeX, Heart, MessageCircle, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoProfileInfo from './VideoProfileInfo';
import SwipeIndicators from './SwipeIndicators';

interface VideoDetailViewProps {
  video: any;
  productLinks: ProductLink[];
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  controlsVisible: boolean;
  handleLike: () => void;
  scrollToComments: () => void;
  handleShare: () => void;
  handleShowProducts: () => void;
  userLikeStatus?: boolean;
  isHovering: boolean;
  setIsHovering: (hovering: boolean) => void;
  hasNextVideo: boolean;
  hasPrevVideo: boolean;
  isMobile: boolean;
  handleScreenTap: () => void;
}

const VideoDetailView: React.FC<VideoDetailViewProps> = ({
  video,
  productLinks,
  isMuted,
  onToggleMute,
  onClose,
  controlsVisible,
  handleLike,
  scrollToComments,
  handleShare,
  handleShowProducts,
  userLikeStatus,
  isHovering,
  setIsHovering,
  hasNextVideo,
  hasPrevVideo,
  isMobile,
  handleScreenTap
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-dm-background">
      {/* Only the actual video container has a black background */}
      <div 
        className="relative w-full h-full md:w-auto md:h-auto md:aspect-video md:max-h-[calc(100vh-32px)] bg-black overflow-hidden"
        onClick={handleScreenTap}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <VideoPlayer 
          video={video} 
          productLinks={productLinks}
          autoPlay={true} 
          showControls={false}
          globalAudioEnabled={!isMuted}
          onAudioStateChange={() => onToggleMute()}
          isFullscreen={true}
          className="w-full h-full"
          objectFit="contain"
          useAspectRatio={false}
        />

        {/* Overlay controls - positioned directly on the video */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 z-30 pointer-events-auto">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 touch-manipulation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute top-4 right-4 z-30 pointer-events-auto">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleMute}
              className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10 touch-manipulation"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>

          {/* Right side action buttons */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-30 pointer-events-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/40 text-white hover:bg-black/60 h-12 w-12 touch-manipulation"
              onClick={handleLike}
            >
              <Heart className={`h-6 w-6 ${userLikeStatus ? 'fill-current text-red-500' : ''}`} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/40 text-white hover:bg-black/60 h-12 w-12 touch-manipulation"
              onClick={scrollToComments}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-black/40 text-white hover:bg-black/60 h-12 w-12 touch-manipulation"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
            
            {productLinks.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/40 text-white hover:bg-black/60 h-12 w-12 touch-manipulation"
                onClick={handleShowProducts}
              >
                <ShoppingCart className="h-6 w-6" />
              </Button>
            )}
          </div>
          
          {/* Video Profile Info - Bottom left */}
          <VideoProfileInfo 
            video={video} 
            controlsVisible={true}
          />
          
          {/* Swipe indicators for mobile */}
          <SwipeIndicators
            controlsVisible={true}
            hasNextVideo={hasNextVideo}
            hasPrevVideo={hasPrevVideo}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoDetailView;
