
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
      return 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,350px)]';
    }
    
    return '';
  };

  return (
    <div className="min-h-screen flex justify-center bg-background overflow-x-hidden w-full">
      {/* Container for max width */}
      <div className="w-full max-w-7xl flex relative">
        {/* Left Sidebar */}
        <div className={`${isMobile ? 'w-0' : 'w-[240px]'} shrink-0`}>
          <MainSidebar />
        </div>
        
        {/* Main Content and Optional Right Section */}
        <div className="flex-1 min-h-screen w-full">
          <div 
            className={`w-full mx-auto ${
              isMobile 
                ? 'pb-20' // Mobile bottom padding
                : `${contentWidth} px-4` // Desktop constraints
            } ${getGridTemplate()} gap-8`}
          >
            {/* Main Content Area */}
            <main className="min-h-screen w-full">
              <Outlet />
            </main>
            
            {/* Right Section - Only shown on desktop when enabled */}
            {!isMobile && showRightSection && layoutMode === 'full' && (
              <aside className="hidden lg:block min-h-screen border-l border-gray-300 pl-6">
                <RightSection />
              </aside>
            )}
          </div>
        </div>
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
