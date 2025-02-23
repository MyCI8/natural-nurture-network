
import { useLocation, Outlet } from "react-router-dom";
import MainSidebar from "./layout/MainSidebar";
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
      <main className="flex-1 ml-[140px] min-h-screen border-l">
        <div className="max-w-[800px] mx-auto px-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
