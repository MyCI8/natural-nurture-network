
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import { useEffect } from "react";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();
  const isNewsArticle = location.pathname.includes('/news/') && location.pathname.split('/').length > 2;

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
      {/* Container for max width */}
      <div className="w-full max-w-7xl flex relative">
        {/* Left Sidebar */}
        <div className={`${isMobile ? 'w-0' : 'w-[240px]'} shrink-0`}>
          <MainSidebar />
        </div>
        
        {/* Main Content - Adjusted to be fluid for news article pages */}
        <main className="flex-1 min-h-screen w-full">
          <div className={`w-full mx-auto ${
            isMobile 
              ? 'pb-20' // Only padding bottom for mobile to avoid bottom nav overlap
              : isNewsArticle 
                ? 'px-4' // Full width for news articles (without max-width constraint)
                : 'max-w-[800px] px-4' // Default desktop constraints and padding
          }`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
