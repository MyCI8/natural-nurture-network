
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
    <div className="min-h-screen flex justify-center bg-background overflow-x-hidden w-full">
      {/* Main container with max width */}
      <div className="w-full max-w-[1400px] flex relative">
        {/* Left Sidebar */}
        <div className={`${isMobile ? 'hidden' : 'block'} news-sidebar`}>
          <MainSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
          {/* Content with proper constraints */}
          <main className={`min-h-screen ${isMobile ? 'pb-20 w-full' : contentWidth}`}>
            <Outlet />
          </main>
        </div>

        {/* Right Section - Only shown when enabled */}
        {!isMobile && showRightSection && layoutMode === 'full' && (
          <aside className="hidden lg:block min-h-screen news-right-section">
            <RightSection />
          </aside>
        )}
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
