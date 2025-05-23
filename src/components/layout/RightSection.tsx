
import { useLocation } from "react-router-dom";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import LatestVideos from "@/components/news/LatestVideos";

const RightSection = () => {
  const location = useLocation();

  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/remedies' || path.startsWith('/remedies/')) {
      return <PopularRemedies />;
    }
    
    if (path === '/news' || path.startsWith('/news/')) {
      return <LatestVideos />;
    }
    
    // Default content for other pages
    return (
      <div className="space-y-6">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">Trending Now</h3>
          <p className="text-muted-foreground text-sm">
            Discover what's popular in natural health
          </p>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 shrink-0 sticky top-0 h-screen overflow-y-auto border-l bg-background/50 backdrop-blur-sm">
      <div className="p-6">
        {renderContent()}
      </div>
    </aside>
  );
};

export default RightSection;
