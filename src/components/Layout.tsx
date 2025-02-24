
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
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <MainSidebar />
      </div>
      
      {/* Main Content */}
      <main className={`min-h-screen w-full ${isMobile ? '' : 'md:pl-60'}`}>
        <div className={`mx-auto ${isMobile ? 'px-2 pb-20' : 'max-w-[600px] px-4'}`}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MainSidebar />
      </div>
    </div>
  );
};

export default Layout;
