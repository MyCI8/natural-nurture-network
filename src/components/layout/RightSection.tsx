
import React from 'react';
import { useLocation } from 'react-router-dom';
import CommentSection from '@/components/video/explore/CommentSection';
import ProductLinksPanel from '@/components/video/explore/ProductLinksPanel';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const RightSection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isExploreDetail = location.pathname.startsWith('/explore/');
  
  // Simple state to simulate auth status
  // This is a temporary fix until we have a proper auth context
  const [user, setUser] = React.useState<null | { id: string }>(null);
  const videoId = isExploreDetail ? location.pathname.split('/').pop() : null;

  if (isMobile) return null;

  if (isExploreDetail && videoId) {
    return (
      <div className="w-full h-full bg-background dark:bg-dm-background overflow-y-auto">
        <CommentSection
          showComments={true}
          setShowComments={() => {}}
          videoId={videoId}
          currentUser={null}
          commentsRef={null}
        />
        <ProductLinksPanel />
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-full p-4 bg-white dark:bg-gray-950 overflow-y-auto",
      "border-l border-gray-200 dark:border-gray-800"
    )}>
      {isExploreDetail ? (
        <ProductLinksPanel />
      ) : (
        <div className="space-y-4">
          {!user && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-medium mb-2">Join the community</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Sign in to like videos, comment, and share with others.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
                size="sm"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-medium mb-2">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['Fashion', 'Tech', 'Home', 'Beauty', 'Fitness'].map(tag => (
                <Button 
                  key={tag}
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate(`/explore?tag=${tag.toLowerCase()}`)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-medium mb-2">Suggested Creators</h3>
            <div className="space-y-3">
              {[
                { name: 'Alex Morgan', username: 'alexm', avatar: 'https://i.pravatar.cc/150?img=1' },
                { name: 'Jamie Chen', username: 'jamiec', avatar: 'https://i.pravatar.cc/150?img=5' },
                { name: 'Taylor Swift', username: 'tswift', avatar: 'https://i.pravatar.cc/150?img=9' }
              ].map(creator => (
                <div key={creator.username} className="flex items-center">
                  <img 
                    src={creator.avatar} 
                    alt={creator.name} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <p className="text-sm font-medium">{creator.name}</p>
                    <p className="text-xs text-gray-500">@{creator.username}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto text-xs"
                  >
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSection;
