
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PopularRemedies from "@/components/remedies/PopularRemedies";
import LatestVideos from "@/components/news/LatestVideos";
import Comments from "@/components/video/Comments";
import ProductLinksList from "@/components/video/ProductLinksList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { usePostManagement } from "@/hooks/usePostManagement";

const RightSection = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deletePost, isDeleting } = usePostManagement();

  // Get current user for comments functionality
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // Fetch video data to get creator info
  const { data: video } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id && location.pathname.startsWith('/explore/') && location.pathname.split('/').length === 3
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

  const handleDeletePost = () => {
    if (id) {
      deletePost(id);
      setShowDeleteDialog(false);
      navigate('/explore');
    }
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'edit':
        if (id) {
          navigate(`/edit-video/${id}`);
        }
        break;
      case 'report':
        // TODO: Implement report functionality
        console.log('Report post');
        break;
    }
  };

  // Check if current user owns the post
  const isPostOwner = currentUser && video && currentUser.id === video.creator_id;

  const renderContent = () => {
    const path = location.pathname;
    
    // Check if we're on an explore video detail page
    if (path.startsWith('/explore/') && path.split('/').length === 3) {
      const videoId = path.split('/')[2];
      
      // Show comments first and product links pinned to bottom
      if (productLinks.length > 0) {
        return (
          <div className="h-full flex flex-col">
            {/* Post Header - Profile info and menu */}
            {video && (
              <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    {video.creator?.avatar_url ? (
                      <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                    ) : (
                      <AvatarFallback>{(video.creator?.username || 'U')[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-semibold text-sm">{video.creator?.username || 'Unknown User'}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isPostOwner && (
                      <>
                        <DropdownMenuItem onClick={() => handleMenuAction('delete')}>
                          Delete Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuAction('edit')}>
                          Edit Post
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem onClick={() => handleMenuAction('report')}>
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            
            {/* Comments Section - Takes most available space */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Comments videoId={videoId} currentUser={currentUser} />
            </div>
            
            {/* Featured Products - Pinned to bottom */}
            <div className="border-t pt-4 flex-shrink-0 max-h-80 overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <ProductLinksList productLinks={productLinks} />
              </div>
            </div>
          </div>
        );
      }
      
      // Fall back to comments only if no product links
      return (
        <div className="h-full flex flex-col">
          {/* Post Header - Profile info and menu */}
          {video && (
            <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  {video.creator?.avatar_url ? (
                    <AvatarImage src={video.creator.avatar_url} alt={video.creator.username || ''} />
                  ) : (
                    <AvatarFallback>{(video.creator?.username || 'U')[0]}</AvatarFallback>
                  )}
                </Avatar>
                <span className="font-semibold text-sm">{video.creator?.username || 'Unknown User'}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isPostOwner && (
                    <>
                      <DropdownMenuItem onClick={() => handleMenuAction('delete')}>
                        Delete Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMenuAction('edit')}>
                        Edit Post
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => handleMenuAction('report')}>
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto min-h-0">
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
    <>
      <aside className="w-80 shrink-0 sticky top-0 h-screen border-l bg-background/50 backdrop-blur-sm">
        <div className="p-6 h-full">
          {renderContent()}
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default RightSection;
