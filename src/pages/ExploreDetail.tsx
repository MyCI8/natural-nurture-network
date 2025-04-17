
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLayout } from '@/contexts/LayoutContext';
import CommentSection from '@/components/video/explore/CommentSection';
import VideoSwipeContainer from '@/components/video/explore/VideoSwipeContainer';
import VideoDetailView from '@/components/video/explore/VideoDetailView';
import { useVideoDetail } from '@/hooks/video/useVideoDetail';

const ExploreDetail = () => {
  const { id } = useParams();
  const { setShowRightSection, setMobileHeaderVisible } = useLayout();
  const commentsRef = useRef<HTMLDivElement>(null);
  
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
      
      return () => {
        setMobileHeaderVisible(true);
      };
    }
  }, [setMobileHeaderVisible, isMobile]);
  
  // Always show right section on ExploreDetail on desktop, never on mobile
  useEffect(() => {
    setShowRightSection(!isMobile);
    
    // Clean up when leaving the page
    return () => setShowRightSection(false);
  }, [setShowRightSection, isMobile]);

  const scrollToComments = () => {
    setShowComments(true);
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black w-full h-full flex flex-col touch-manipulation fixed inset-0">
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
            controlsVisible={controlsVisible}
            handleLike={handleLike}
            scrollToComments={scrollToComments}
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

        {/* Product Links Section - Below Comments */}
        {productLinks.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="bg-white dark:bg-black p-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium mb-3">Featured Products</h3>
              <div className="space-y-2">
                {productLinks.map((link) => (
                  <div 
                    key={link.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center"
                  >
                    {link.image_url && (
                      <img 
                        src={link.image_url} 
                        alt={link.title} 
                        className="w-16 h-16 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{link.title}</h4>
                      {link.price && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${link.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isMobile && (
        <CommentSection
          showComments={showComments}
          setShowComments={setShowComments}
          videoId={video.id}
          currentUser={currentUser}
          commentsRef={commentsRef}
        />
      )}
    </div>
  );
};

export default ExploreDetail;
