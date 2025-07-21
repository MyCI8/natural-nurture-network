
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSection from "./layout/RightSection";
import TopHeader from "./layout/TopHeader";
import BottomNav from "./layout/BottomNav";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useEffect, useState, useMemo } from "react";
import { OptimizedLayoutProvider, useOptimizedLayout } from "@/contexts/OptimizedLayoutContext";

// Inner layout component that uses the layout context
const LayoutContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { layoutMode, showRightSection, contentWidth, contentMaxWidth, isFullWidth, isInReelsMode } = useOptimizedLayout();
  
  // Memoize computed values
  const isHomePage = useMemo(() => {
    const path = location.pathname;
    return path === '/' || path === '/home';
  }, [location.pathname]);
  
  const shouldHideRightSection = useMemo(() => {
    const path = location.pathname;
    return path === '/' || path === '/home' || path === '/explore' || 
           path === '/experts' || path === '/ingredients' || 
           path === '/health-concerns';
  }, [location.pathname]);
  
  const shouldShowTopHeader = useMemo(() => 
    isMobile && !isInReelsMode, [isMobile, isInReelsMode]
  );
  
  const shouldShowBottomNav = useMemo(() => 
    isMobile && !isInReelsMode, [isMobile, isInReelsMode]
  );
  
  const mainContentClasses = useMemo(() => {
    const baseClasses = 'flex-1 min-h-screen relative z-0 overflow-x-hidden';
    const mobileClasses = isMobile ? 
      `${isHomePage ? 'pt-0' : isInReelsMode ? 'pt-0' : 'pt-14'} pb-16` : '';
    return `${baseClasses} ${mobileClasses}`;
  }, [isMobile, isHomePage, isInReelsMode]);
  
  const contentContainerClasses = useMemo(() => {
    const isExplorePage = location.pathname === '/explore';
    
    // For Instagram-style pages, use full width without constraints
    if (isFullWidth || isHomePage || isExplorePage) {
      console.log('🎯 Layout: Full width mode for page:', { 
        pathname: location.pathname, 
        isFullWidth, 
        isHomePage, 
        isExplorePage 
      });
      return 'w-full h-full';
    }
    
    // For other pages, apply normal layout constraints
    const widthClass = 'mx-auto';
    const contentWidthClass = contentWidth;
    const maxWidthClass = contentMaxWidth;
    
    console.log('📐 Layout: Constrained width mode:', { 
      pathname: location.pathname, 
      classes: `${widthClass} ${contentWidthClass} ${maxWidthClass}` 
    });
    
    return `${widthClass} ${contentWidthClass} ${maxWidthClass} h-full`;
  }, [isFullWidth, isHomePage, contentWidth, contentMaxWidth, location.pathname]);

  return (
    <div className="min-h-screen flex bg-background dark:bg-background w-full max-w-[100vw] overflow-x-hidden">
      {/* Main container with responsive layout */}
      <div className="w-full max-w-[1400px] mx-auto flex relative" style={{ isolation: 'isolate' }}>
        {/* Mobile Top Header */}
        {shouldShowTopHeader && <TopHeader />}
        
        {/* Left Sidebar - Hide on mobile */}
        {!isMobile && (
          <div className={`${isTablet ? 'w-16' : 'w-64'} shrink-0 sticky top-0 h-screen z-10`}>
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <main className={mainContentClasses}>
          <div className={contentContainerClasses}>
            <Outlet />
          </div>
        </main>

        {/* Right Section */}
        {!isMobile && showRightSection && !shouldHideRightSection && <RightSection />}
        
        {/* Mobile Bottom Navigation */}
        {shouldShowBottomNav && <BottomNav />}
      </div>
    </div>
  );
};

// Main layout component that provides the context
const Layout = () => {
  return (
    <OptimizedLayoutProvider>
      <LayoutContent />
    </OptimizedLayoutProvider>
  );
};

export default Layout;
