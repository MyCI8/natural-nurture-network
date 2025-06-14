import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import LatestVideos from "@/components/news/LatestVideos";
import Comments from "@/components/video/Comments";
import ProductLinksList from "@/components/video/ProductLinksList";

const RightSection = () => {
  const location = useLocation();
  const { id } = useParams();

  // Get current user for comments functionality
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // Fetch product links for explore detail pages
  const { data: productLinks = [] } = useQuery({
    queryKey: ['videoProductLinks', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('video_product_links')
        .select('*')
        .eq('video_id', id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && location.pathname.startsWith('/explore/') && location.pathname.split('/').length === 3
  });

  const renderContent = () => {
    const path = location.pathname;
    
    // Check if we're on an explore video detail page
    if (path.startsWith('/explore/') && path.split('/').length === 3) {
      const videoId = path.split('/')[2];
      
      // Show comments first and product links pinned to bottom
      if (productLinks.length > 0) {
        return (
          <div className="h-full flex flex-col">
            {/* Comments Section - Takes most of the space */}
            <div className="border-b pb-3 mb-4">
              <h3 className="text-lg font-semibold">Comments</h3>
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              <Comments videoId={videoId} currentUser={currentUser} />
            </div>
            
            {/* Featured Products - Pinned to bottom */}
            <div className="border-t pt-4 max-h-64 overflow-hidden">
              <h3 className="text-lg font-semibold mb-3">Featured Products</h3>
              <div className="max-h-48 overflow-y-auto">
                <ProductLinksList productLinks={productLinks} />
              </div>
            </div>
          </div>
        );
      }
      
      // Fall back to comments only if no product links
      return (
        <div className="h-full flex flex-col">
          <div className="border-b pb-3 mb-4">
            <h3 className="text-lg font-semibold">Comments</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <Comments videoId={videoId} currentUser={currentUser} />
          </div>
        </div>
      );
    }
    
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
      <div className="p-6 h-full">
        {renderContent()}
      </div>
    </aside>
  );
};

export default RightSection;
