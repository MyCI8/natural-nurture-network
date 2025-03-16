
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSection from "./layout/RightSection";
import TopHeader from "./layout/TopHeader";
import BottomNav from "./layout/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Inner layout component that uses the layout context
const LayoutContent = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { layoutMode, showRightSection, contentWidth, contentMaxWidth, isFullWidth } = useLayout();
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  
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

  // Determine if mobile right section should be available based on route
  const showMobileRightTab = isMobile && (
    location.pathname === '/news' || 
    location.pathname.startsWith('/news/') ||
    location.pathname.startsWith('/explore/') ||
    location.pathname.startsWith('/symptoms/')
  );

  return (
    <div className="min-h-screen flex bg-white dark:bg-black w-full">
      {/* Main container with responsive layout */}
      <div className="w-full flex relative">
        {/* Mobile Top Header - only on mobile */}
        {isMobile && <TopHeader />}
        
        {/* Left Sidebar - Hide on mobile */}
        {!isMobile && (
          <div className="w-64 shrink-0 sticky top-0 h-screen z-50">
            <MainSidebar />
          </div>
        )}
        
        {/* Main Content Area */}
        <main 
          className={`flex-1 min-h-screen ${isMobile ? 'pb-16 pt-14' : ''} relative z-10`}
        >
          <div 
            className={`
              ${isFullWidth ? 'w-full' : 'mx-auto'} 
              ${contentWidth}
              ${!isFullWidth && `${contentMaxWidth}`}
            `}
          >
            {/* Mobile Right Section Trigger */}
            {showMobileRightTab && (
              <div className="fixed bottom-20 right-4 z-30">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="secondary" className="rounded-full shadow-md">
                      <PanelRight className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85%] sm:w-[350px] p-0">
                    <RightSection />
                  </SheetContent>
                </Sheet>
              </div>
            )}
            <Outlet />
          </div>
        </main>

        {/* Right Section - Only shown when enabled and not on mobile */}
        {!isMobile && showRightSection && (
          <aside className="w-[350px] shrink-0 h-screen sticky top-0 border-l border-border z-20">
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
