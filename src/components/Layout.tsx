
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSection from "./layout/RightSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext";

// Inner layout component that uses the layout context
const LayoutContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { layoutMode, showRightSection, contentWidth } = useLayout();

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

  // Determine grid template based on layout mode and mobile state
  const getGridTemplate = () => {
    if (isMobile) return '';
    
    if (layoutMode === 'full' && showRightSection) {
      return 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)_350px]';
    }
    
    if (layoutMode === 'wide') {
      return 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)]';
    }
    
    return 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)]';
  };

  return (
    <div className="min-h-screen flex justify-center bg-background overflow-x-hidden w-full">
      {/* Container for max width */}
      <div className={`w-full max-w-7xl mx-auto ${getGridTemplate()} gap-0`}>
        {/* Left Sidebar - Column 1 */}
        <div className={`${isMobile ? 'hidden' : 'block'} shrink-0 border-r border-border`}>
          <MainSidebar />
        </div>
        
        {/* Main Content - Column 2 */}
        <div className="min-h-screen w-full">
          <main className={`w-full ${isMobile ? 'pb-20' : contentWidth} px-6`}>
            <Outlet />
          </main>
        </div>
        
        {/* Right Section - Column 3 (only shown when enabled) */}
        {!isMobile && showRightSection && layoutMode === 'full' && (
          <aside className="hidden lg:block min-h-screen border-l border-border">
            <div className="px-6 h-full">
              <RightSection />
            </div>
          </aside>
        )}
      </div>
      
      {/* Mobile Version of Layout */}
      {isMobile && (
        <MainSidebar />
      )}
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
