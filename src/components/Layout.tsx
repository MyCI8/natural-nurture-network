
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSection from "./layout/RightSection";
import TopHeader from "./layout/TopHeader";
import BottomNav from "./layout/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext";

// Inner layout component that uses the layout context
const LayoutContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { layoutMode, showRightSection, contentWidth, contentMaxWidth, isFullWidth } = useLayout();
  
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
    <div className="min-h-screen flex bg-white dark:bg-black w-full">
      {/* Main container with responsive layout */}
      <div className="w-full flex relative">
        {/* Mobile Top Header - only on mobile */}
        {isMobile && <TopHeader />}
        
        {/* Left Sidebar - Hide on mobile */}
        {!isMobile && (
          <div className="w-64 shrink-0 sticky top-0 h-screen">
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-screen ${isMobile ? 'pb-16 pt-14' : ''}`}
        >
          <div 
            className={`
              ${isFullWidth ? 'w-full' : 'max-w-[1400px] mx-auto'} 
              ${contentWidth}
            `}
          >
            <Outlet />
          </div>
        </main>

        {/* Right Section - Only shown when enabled and not on mobile */}
        {!isMobile && showRightSection && (
          <aside className="w-[350px] shrink-0 h-screen sticky top-0 border-l border-border">
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
