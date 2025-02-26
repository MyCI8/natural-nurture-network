
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
      <div className="w-full max-w-7xl flex relative">
        {isMobile ? (
          <Sheet>
            <SheetTrigger className="fixed top-4 left-4 z-50">
              <Menu className="w-6 h-6 text-foreground" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <MainSidebar />
            </SheetContent>
          </Sheet>
        ) : (
          <div className="w-[240px] shrink-0">
            <MainSidebar />
          </div>
        )}
        
        <main className="flex-1 min-h-screen w-full">
          <div className={`w-full mx-auto ${
            isMobile 
              ? 'px-4 pt-16' // Add padding top for mobile menu button
              : 'max-w-[800px] px-4'
          }`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
