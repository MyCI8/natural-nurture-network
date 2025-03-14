
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
  const { layoutMode, showRightSection } = useLayout();
  
  // Routes that have a right section
  const hasRightSectionRoutes = 
    location.pathname.startsWith('/news/') || 
    location.pathname.startsWith('/explore/') ||
    location.pathname.startsWith('/symptoms/');

  // Determine if we should show the right column
  const shouldShowRightSection = showRightSection && hasRightSectionRoutes;

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
    <div className="min-h-screen flex justify-center bg-white dark:bg-black w-full overflow-x-hidden">
      {/* Main container with max width */}
      <div className="w-full max-w-[1400px] flex relative">
        {/* Mobile Top Header - only on mobile */}
        {isMobile && <TopHeader />}
        
        {/* Left Sidebar - Hide on mobile */}
        <div className={`${isMobile ? 'hidden' : 'block'} sticky top-0 h-screen w-64 shrink-0`}>
          <MainSidebar />
        </div>
        
        {/* Main Content Area */}
        <main className={`flex-1 min-h-screen ${shouldShowRightSection ? 'max-w-[calc(100%-350px)]' : 'w-full'} ${isMobile ? 'pb-16' : ''}`}>
          <Outlet />
        </main>

        {/* Right Section - Only shown when enabled and not on mobile */}
        {!isMobile && shouldShowRightSection && (
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
