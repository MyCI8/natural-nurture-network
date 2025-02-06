import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {showBackButton && (
        <div className="fixed left-4 top-24 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-background/80 backdrop-blur"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
      )}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;