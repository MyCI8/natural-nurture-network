
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
      <div className="w-full max-w-[1265px] flex relative">
        {/* Main Content with Sidebar */}
        <div className="flex-1 flex justify-center relative">
          {/* Sidebar Container - Positioned relative to centered content */}
          <div className="hidden md:block w-60 absolute left-0 top-0 bottom-0">
            <div className="sticky top-0 h-screen">
              <MainSidebar />
            </div>
          </div>
          
          {/* Centered Content */}
          <main className="w-full max-w-[600px] min-h-screen">
            <div className={`w-full mx-auto ${isMobile ? 'px-2 pb-20' : 'px-4'}`}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MainSidebar />
        </div>
      </div>
    </div>
  );
};

export default Layout;
