
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLayout } from '@/contexts/LayoutContext';
import VideoSwipeContainer from '@/components/video/explore/VideoSwipeContainer';
import VideoDetailView from '@/components/video/explore/VideoDetailView';
import { useVideoDetail } from '@/hooks/video/useVideoDetail';

const ExploreDetail = () => {
  const { id } = useParams();
  const { setMobileHeaderVisible, setShowRightSection } = useLayout();
  
  const {
    // State
    video,
    isVideoLoading,
    productLinks,
    currentUser,
    userLikeStatus,
    isMuted,
    isHovering,
    setIsHovering,
    controlsVisible,
    showComments,
    setShowComments,
    
    // Actions
    handleClose,
    handleToggleMute,
    handleLike,
    handleShare,
    handleShowProducts,
    handleSwipe,
    handleScreenTap,
    
    // Navigation helpers
    hasNextVideo,
    hasPrevVideo,
    
    // Device info
    isMobile
  } = useVideoDetail(id);
  
  // Hide mobile header when entering fullscreen mode (mobile only)
  useEffect(() => {
    if (isMobile) {
      setMobileHeaderVisible(false);
      return () => setMobileHeaderVisible(true);
    }
  }, [setMobileHeaderVisible, isMobile]);

  // Show right section on desktop and pass product links
  useEffect(() => {
    if (!isMobile && video) {
      setShowRightSection(true);
      
      // Display product links in the right panel if available
      if (productLinks && productLinks.length > 0) {
        window.dispatchEvent(
          new CustomEvent('display-product-links', { 
            detail: { productLinks } 
          })
        );
      }
      
      return () => {
        window.dispatchEvent(new CustomEvent('clear-product-links'));
      };
    }
    
    return () => {
      if (!isMobile) {
        setShowRightSection(false);
      }
    };
  }, [video, productLinks, setShowRightSection, isMobile]);

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">Video not found</div>;
  }

  return (
    <div className="min-h-screen w-full h-full flex fixed inset-0 bg-white dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="flex-1 relative">
        <VideoSwipeContainer 
          onSwipe={handleSwipe}
          disabled={!isMobile}
        >
          <VideoDetailView
            video={video}
            productLinks={productLinks}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onClose={handleClose}
            controlsVisible={true} // Always show controls
            handleLike={handleLike}
            scrollToComments={() => setShowComments(true)}
            handleShare={handleShare}
            handleShowProducts={handleShowProducts}
            userLikeStatus={userLikeStatus}
            isHovering={isHovering}
            setIsHovering={setIsHovering}
            hasNextVideo={hasNextVideo}
            hasPrevVideo={hasPrevVideo}
            isMobile={isMobile}
            handleScreenTap={handleScreenTap}
          />
        </VideoSwipeContainer>
      </div>
    </div>
  );
};

export default ExploreDetail;
