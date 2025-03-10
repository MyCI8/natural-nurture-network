
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
  const { 
    layoutMode, 
    showRightSection, 
    showLeftSidebar,
    contentWidth, 
    contentClass,
    mainClass 
  } = useLayout();
  const isExplorePage = location.pathname === '/explore' || location.pathname.startsWith('/explore/');
  const isAdminPage = location.pathname.startsWith('/admin');

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

  if (isAdminPage) {
    // Admin pages use their own layout
    return (
      <div className="min-h-screen w-full">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-white dark:bg-black overflow-x-hidden w-full">
      {/* Main container with max width */}
      <div className="w-full max-w-[1400px] flex relative">
        {/* Left Sidebar */}
        {showLeftSidebar && (
          <div className={`${isMobile ? 'hidden' : 'block'} ${isExplorePage ? 'w-[80px]' : 'x-sidebar'}`}>
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 min-h-screen x-content">
          {/* Content with proper constraints */}
          <main className={`${mainClass} ${isMobile ? 'pb-20 w-full' : contentWidth}`}>
            <div className={contentClass}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* Right Section - Only shown when enabled */}
        {!isMobile && showRightSection && layoutMode === 'full' && (
          <aside className="hidden lg:block min-h-screen x-right-section">
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
