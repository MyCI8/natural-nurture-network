
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header - Only shown on mobile */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-50">
          {/* Mobile header content handled in MainSidebar component */}
        </div>
      )}

      <div className="flex-grow flex">
        {/* Left Sidebar - Hidden on mobile */}
        {!isMobile && (
          <div className="w-[240px] shrink-0 border-r border-border">
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="flex-grow min-h-screen">
          <main className={`${contentWidth} px-6 py-4 ${isMobile ? 'pb-20 pt-16' : ''}`}>
            <Outlet />
          </main>
        </div>
        
        {/* Right Section - Only shown when enabled and on desktop */}
        {!isMobile && showRightSection && layoutMode === 'full' && (
          <div className="w-[350px] shrink-0 border-l border-border">
            <div className="p-6 h-full">
              <RightSection />
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Navigation - Only shown on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-50">
          {/* Mobile navigation content handled in MainSidebar component */}
        </div>
      )}

      {/* Mobile Sidebar Overlay - Rendered by MainSidebar component */}
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
