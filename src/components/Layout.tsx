
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
    <div className="min-h-screen flex bg-background overflow-x-hidden w-full">
      {/* Left Sidebar */}
      <MainSidebar />
      
      {/* Main Content */}
      <main className={`flex-1 ${isMobile ? 'ml-[72px]' : 'ml-[240px]'} min-h-screen w-full`}>
        <div className={`w-full mx-auto ${isMobile ? 'px-2 max-w-full' : 'max-w-[800px] px-4'} overflow-x-hidden`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
