import React from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import { ProductLink } from '@/types/video';
import { X, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoControls from './VideoControls';
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
    <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden bg-black">
      <div className="relative flex-1 flex items-center justify-center">
        <div 
          className="relative w-full aspect-[9/16] md:aspect-video max-h-full"
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

          <div className={`absolute inset-0 pointer-events-none ${controlsVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <div className="absolute top-4 left-4 z-30 pointer-events-auto">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="absolute top-4 right-4 z-30 pointer-events-auto">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onToggleMute}
                className="rounded-full bg-black/40 text-white hover:bg-black/60 h-10 w-10"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            {isMobile && (
              <>
                <VideoControls
                  controlsVisible={controlsVisible}
                  handleClose={onClose}
                  handleLike={handleLike}
                  scrollToComments={scrollToComments}
                  handleShare={handleShare}
                  handleShowProducts={handleShowProducts}
                  handleToggleMute={onToggleMute}
                  productLinks={productLinks}
                  isMuted={isMuted}
                  userLikeStatus={userLikeStatus}
                />
                
                <VideoProfileInfo 
                  video={video} 
                  controlsVisible={controlsVisible}
                />
                
                <SwipeIndicators
                  controlsVisible={controlsVisible}
                  hasNextVideo={hasNextVideo}
                  hasPrevVideo={hasPrevVideo}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailView;
