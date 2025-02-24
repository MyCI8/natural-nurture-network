
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

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
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-60 shrink-0">
          <MainSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen w-full">
          <div className={`w-full mx-auto ${isMobile ? 'px-2 pb-20' : 'max-w-[600px] px-4'}`}>
            <Outlet />
          </div>
        </main>

        {/* Show mobile navigation */}
        <div className="md:hidden">
          <MainSidebar />
        </div>
      </div>
    </div>
  );
};

export default Layout;
