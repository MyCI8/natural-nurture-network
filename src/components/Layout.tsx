
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSection from "./layout/RightSection";
import TopHeader from "./layout/TopHeader";
import BottomNav from "./layout/BottomNav";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useEffect, useState, useMemo } from "react";
import { OptimizedLayoutProvider, useOptimizedLayout } from "@/contexts/OptimizedLayoutContext";
import { cn } from "@/lib/utils";

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
    const baseClasses = 'flex-1 min-h-screen relative z-0 overflow-visible'; // Change to overflow-visible for full expansion
    const mobileClasses = isMobile ? 
      `${isHomePage ? 'pt-0' : isInReelsMode ? 'pt-0' : 'pt-14'} pb-16` : '';
    return `${baseClasses} ${mobileClasses}`;
  }, [isMobile, isHomePage, isInReelsMode]);
  
  const contentContainerClasses = useMemo(() => {
    const widthClass = isFullWidth || isHomePage ? 'w-full' : 'mx-auto';
    const contentWidthClass = (!isFullWidth && !isHomePage) ? contentWidth : '';
    const maxWidthClass = (!isFullWidth && !isHomePage) ? contentMaxWidth : '';
    return `${widthClass} ${contentWidthClass} ${maxWidthClass} h-full`;
  }, [isFullWidth, isHomePage, contentWidth, contentMaxWidth]);

  return (
    <div className="min-h-screen flex bg-background dark:bg-background w-full max-w-[100vw] overflow-x-hidden">
      {/* Main container with responsive layout */}
      <div 
        className={cn(
          "w-full max-w-7xl mx-auto flex relative",
          !isMobile && "md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-4 lg:gap-6" // Center layout, flexible center
        )} 
        style={{ isolation: 'isolate' }}
      >
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
