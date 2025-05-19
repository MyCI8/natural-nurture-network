
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useIsMobile } from '@/hooks/use-mobile';

interface RightSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const RightSection: React.FC<RightSectionProps> = ({
  children,
  className
}) => {
  const { 
    showRightSection, 
    toggleRightSection,
    isFullscreenRightSection,
    setFullscreenRightSection,
    isInReelsMode
  } = useLayout();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Close right section when navigating away
  useEffect(() => {
    if (!showRightSection) return;
    
    // Skip closing if we're in reels mode
    if (isInReelsMode) return;
    
    // Only close on major route changes to different sections
    if (location.pathname.includes('/explore')) {
      return; // Don't close when navigating within explore
    }
    
    toggleRightSection(false);
  }, [location.pathname, toggleRightSection]);
  
  // Setup swipe gestures for mobile
  const { handlers } = useTouchGestures({
    onSwipe: (direction) => {
      if (direction === 'right') {
        toggleRightSection(false);
      }
    }
  }, {
    threshold: 100 // Use options object for threshold
  });
  
  // Early return if not showing
  if (!showRightSection) {
    return null;
  }

  const handleClose = () => {
    toggleRightSection(false);
  };
  
  const toggleFullscreen = () => {
    setFullscreenRightSection(!isFullscreenRightSection);
  };
  
  // Determine classes based on fullscreen state
  const containerClasses = cn(
    "fixed inset-y-0 right-0 bg-white dark:bg-dm-background",
    "z-30 flex flex-col shadow-lg transition-all duration-300 ease-in-out",
    {
      "w-full": isFullscreenRightSection || isMobile, 
      "w-[560px] border-l dark:border-dm-mist": !isFullscreenRightSection && !isMobile,
    },
    className
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={handleClose}
        ></div>
      )}
      
      {/* Right section content */}
      <div 
        className={containerClasses}
        {...(isMobile ? handlers : {})}
      >
        {/* Header with close button */}
        <div className="h-14 border-b dark:border-dm-mist flex items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="dark:text-dm-text"
          >
            {isMobile ? <ChevronLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
          
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen} 
              className="dark:text-dm-text"
            >
              {isFullscreenRightSection ? 
                <ChevronRight className="h-5 w-5" /> : 
                <ChevronLeft className="h-5 w-5" />}
            </Button>
          )}
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
};

export default RightSection;
