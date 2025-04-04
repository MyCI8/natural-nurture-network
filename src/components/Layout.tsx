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
  const { layoutMode, showRightSection, contentWidth, contentMaxWidth, isFullWidth } = useLayout();
  const [isHomePage, setIsHomePage] = useState(false);
  
  // Determine if we're on the home page
  useEffect(() => {
    const path = location.pathname;
    setIsHomePage(path === '/' || path === '/home');
  }, [location]);
  
  // Prevent unwanted redirects
  useEffect(() => {
    const preventUnwantedRedirect = (e: BeforeUnloadEvent) => {
      if (location.pathname !== "/") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", preventUnwantedRedirect);
    return () => {
      window.removeEventListener("beforeunload", preventUnwantedRedirect);
    };
  }, [location]);

  return (
    <div className="min-h-screen flex bg-background dark:bg-background w-full max-w-[100vw] overflow-x-hidden">
      {/* Main container with responsive layout - increased max-width to 1400px */}
      <div className="w-full max-w-[1400px] mx-auto flex relative">
        {/* Mobile Top Header - only on mobile */}
        {isMobile && <TopHeader />}
        
        {/* Left Sidebar - Hide on mobile */}
        {!isMobile && (
          <div className={`${isTablet ? 'w-16' : 'w-64'} shrink-0 sticky top-0 h-screen z-50`}>
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-screen ${
            isMobile ? `${isHomePage ? 'pt-0' : 'pt-14'} pb-16` : ''
          } relative z-10 overflow-x-hidden`}
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

        {/* Right Section - Only shown when enabled and not on mobile */}
        {!isMobile && showRightSection && (
          <aside className={`${isTablet ? 'w-[300px]' : 'w-[350px]'} shrink-0 h-screen sticky top-0 border-l border-border z-20 overflow-hidden`}>
            <RightSection />
          </aside>
        )}
        
        {/* Mobile Bottom Navigation - only on mobile */}
        {isMobile && <BottomNav />}
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
