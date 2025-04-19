
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLayout } from '@/contexts/LayoutContext';
import VideoSwipeContainer from '@/components/video/explore/VideoSwipeContainer';
import VideoDetailView from '@/components/video/explore/VideoDetailView';
import { useVideoDetail } from '@/hooks/video/useVideoDetail';
import Comments from '@/components/video/Comments';
import ProductLinkCard from '@/components/video/ProductLinkCard';

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
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dm-background">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dm-background">Video not found</div>;
  }

  return (
    <div className="min-h-screen w-full h-full flex flex-col md:flex-row fixed inset-0 bg-white dark:bg-dm-background">
      {/* Main Content Area - Video Player */}
      <div className="flex-1 relative flex items-center justify-center bg-white dark:bg-dm-background">
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
            controlsVisible={true} // Always visible
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
      
      {/* Right Column - Comments and Products */}
      {!isMobile && (
        <div className="hidden md:block w-[350px] bg-white dark:bg-dm-background border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Comments</h2>
            <Comments videoId={video.id} currentUser={currentUser} />
            
            {/* Product Links (if any) */}
            {productLinks.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2 text-foreground">Featured Products</h3>
                {productLinks.map(link => (
                  <div key={link.id} className="mb-3">
                    <ProductLinkCard link={link} onClose={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreDetail;
