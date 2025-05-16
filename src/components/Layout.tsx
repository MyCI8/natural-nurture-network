
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSection from "./layout/RightSection";
import TopHeader from "./layout/TopHeader";
import BottomNav from "./layout/BottomNav";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext";

// Inner layout component that uses the layout context
const LayoutContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { 
    layoutMode, 
    showRightSection, 
    contentWidth, 
    contentMaxWidth, 
    isFullWidth,
    isInReelsMode 
  } = useLayout();
  
  const [isHomePage, setIsHomePage] = useState(false);
  
  // Determine if we're on the home page
  useEffect(() => {
    const path = location.pathname;
    setIsHomePage(path === '/' || path === '/home');
  }, [location]);

  // Manage scroll behavior for mobile
  useEffect(() => {
    const preventBodyScroll = isMobile && isInReelsMode;
    
    if (preventBodyScroll) {
      // Lock the body scroll when in reels mode on mobile
      document.body.style.overflow = 'hidden';
    } else {
      // Allow scrolling in normal mode
      document.body.style.overflow = '';
    }
    
    return () => {
      // Reset on unmount
      document.body.style.overflow = '';
    };
  }, [isMobile, isInReelsMode]);
  
  return (
    <div className="min-h-screen flex bg-background dark:bg-background w-full max-w-[100vw] overflow-x-hidden">
      {/* Main container with responsive layout - increased max-width to 1400px */}
      <div className="w-full max-w-[1400px] mx-auto flex relative" style={{ isolation: 'isolate' }}>
        {/* Mobile Top Header - only on mobile and not in reels mode */}
        {isMobile && !isInReelsMode && <TopHeader />}
        
        {/* Left Sidebar - Hide on mobile */}
        {!isMobile && (
          <div className={`${isTablet ? 'w-16' : 'w-64'} shrink-0 sticky top-0 h-screen z-10`}>
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-screen ${
            isMobile ? `${isHomePage ? 'pt-0' : isInReelsMode ? 'pt-0' : 'pt-14'} pb-16` : ''
          } relative z-0 overflow-x-hidden touch-manipulation`}
        >
          <div 
            className={`
              ${isFullWidth || isHomePage ? 'w-full' : 'mx-auto'} 
              ${(!isFullWidth && !isHomePage) ? contentWidth : ''}
              ${(!isFullWidth && !isHomePage) ? contentMaxWidth : ''}
              h-full
            `}
          >
            <Outlet />
          </div>
        </main>

        {/* Right Section - rendered conditionally by the RightSection component itself */}
        {!isMobile && showRightSection && <RightSection />}
        
        {/* Mobile Bottom Navigation - only on mobile and not in reels mode */}
        {isMobile && !isInReelsMode && <BottomNav />}
      </div>
    </div>
  );
};

// Main layout component that provides the context
const Layout = () => {
  return (
    <LayoutProvider>
      <LayoutContent />
    </LayoutProvider>
  );
};

export default Layout;
