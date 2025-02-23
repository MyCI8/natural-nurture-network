
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
import RightSidebar from "./layout/RightSidebar";
import { useEffect } from "react";

const Layout = () => {
  const location = useLocation();

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
    <div className="min-h-screen flex bg-background">
      {/* Left Sidebar */}
      <MainSidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-[280px] mr-[350px] min-h-screen border-l border-r">
        <div className="max-w-[600px] mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default Layout;
