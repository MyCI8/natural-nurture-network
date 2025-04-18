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

  // Custom event to send product links to the right section
  useEffect(() => {
    if (!isMobile && productLinks.length > 0) {
      // Send event with product links to be displayed in right section
      window.dispatchEvent(new CustomEvent('display-product-links', {
        detail: { productLinks }
      }));
    }
    
    // Clean up when component unmounts
    return () => {
      window.dispatchEvent(new CustomEvent('clear-product-links'));
    };
  }, [productLinks, isMobile]);

  // Show right section in desktop mode
  useEffect(() => {
    setShowRightSection(!isMobile);
    return () => setShowRightSection(false);
  }, [setShowRightSection, isMobile]);

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">Video not found</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black w-full h-full flex flex-col fixed inset-0">
      <div className="flex-1 flex">
        {/* Video Container */}
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
        </div>
        
        {/* Desktop Comments Section */}
        {!isMobile && (
          <div className="w-[350px] border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
            <CommentSection
              showComments={true}
              setShowComments={setShowComments}
              videoId={video.id}
              currentUser={currentUser}
              commentsRef={commentsRef}
            />
          </div>
        )}
      </div>
      
      {/* Mobile Comments Section */}
      {isMobile && (
        <>
          <CommentSection
            showComments={showComments}
            setShowComments={setShowComments}
            videoId={video.id}
            currentUser={currentUser}
            commentsRef={commentsRef}
          />
        </>
      )}
    </div>
  );
};

export default ExploreDetail;
