
import React, { useState } from 'react';
import VideoPlayer from '@/components/video/VideoPlayer';
import { ProductLink } from '@/types/video';
import VideoDetailHeader from './VideoDetailHeader';
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
    <div 
      className="absolute inset-0 w-full h-full z-0"
      onClick={handleScreenTap}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <VideoPlayer 
        video={video} 
        productLinks={productLinks}
        autoPlay={true} 
        showControls={false}
        onClose={onClose} 
        isFullscreen={true} 
        className="w-full h-full" 
        objectFit="contain" 
        useAspectRatio={false}
        globalAudioEnabled={!isMuted}
        onAudioStateChange={(muted) => onToggleMute()}
      />

      {/* Desktop header or mobile controls based on device */}
      {!isMobile ? (
        <VideoDetailHeader 
          handleClose={onClose}
          handleToggleMute={onToggleMute}
          isMuted={isMuted}
          isHovering={isHovering}
          isMobile={isMobile}
        />
      ) : (
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
  );
};

export default VideoDetailView;
