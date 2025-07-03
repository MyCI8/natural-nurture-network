import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Swipeable } from '@/components/ui/swipeable';
import { Progress } from '@/components/ui/progress';
import { Video } from '@/types/video';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileReelsView from '@/components/video/MobileReelsView';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePostManagement } from '@/hooks/usePostManagement';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection, setIsInReelsMode } = useLayout();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deletePost, isDeleting } = usePostManagement();
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number | null>(null);
  const [videoSize, setVideoSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setShowRightSection(true);
    
    // When component unmounts, ensure we reset the reels mode
    return () => {
      setShowRightSection(false);
      setIsInReelsMode(false);
    };
  }, [setShowRightSection, setIsInReelsMode]);

  const handleClose = () => {
    // Always navigate back to explore page
    navigate('/explore');
  };

  const handleNaturalAspectRatioChange = useCallback((ratio: number) => {
    // Check for a valid, new ratio to prevent unnecessary re-renders
    if (ratio > 0 && ratio !== naturalAspectRatio) {
      setNaturalAspectRatio(ratio);
    }
  }, [naturalAspectRatio]);

  // Remove the complex sizing logic and use fixed container approach like explore page

  // Get current user for permission checks
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: video, isLoading: isVideoLoading } = useQuery({
    queryKey: ['video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          related_article_id,
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

      return {
        ...data,
        related_article_id: data.related_article_id || null
      };
    }
  });

  // Query to fetch adjacent videos for swipe navigation
  const { data: adjacentVideos = [], isLoading: isAdjacentLoading } = useQuery({
    queryKey: ['adjacent-videos', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          creator_id,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          )
        `)
        .not('video_type', 'eq', 'news') // Exclude news videos
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      return data as Video[];
    },
    enabled: !!id
  });

  // Find the current index in the adjacentVideos array
  const currentIndex = adjacentVideos.findIndex(v => v.id === id);
  
  // Handle video progress updates
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    // Close the detail view if swiping down or right
    if (direction === 'down' || direction === 'right') {
      handleClose();
      return;
    }
    
    // Navigate to next video if swiping up
    if (direction === 'up') {
      if (currentIndex < adjacentVideos.length - 1) {
        const nextVideo = adjacentVideos[currentIndex + 1];
        if (nextVideo) {
          navigate(`/explore/${nextVideo.id}`, { replace: true });
        }
      }
      return;
    }
    
    // Navigate to previous video if swiping left
    if (direction === 'left') {
      if (currentIndex > 0) {
        const prevVideo = adjacentVideos[currentIndex - 1];
        if (prevVideo) {
          navigate(`/explore/${prevVideo.id}`, { replace: true });
        }
      }
      return;
    }
  };

  const handleAudioStateChange = (isMuted: boolean) => {
    setGlobalAudioEnabled(!isMuted);
  };

  const handleDeletePost = () => {
    if (id) {
      deletePost(id);
      setShowDeleteDialog(false);
      navigate('/explore');
    }
  };

  // Check if current user owns the post
  const isPostOwner = currentUser && video && currentUser.id === video.creator_id;

  useEffect(() => {
    // Reset progress when video changes
    setProgress(0);
    setIsLoading(true);
    setNaturalAspectRatio(null); // This is key to triggering a resize with fallback
  }, [id]);

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  // Use a more Instagram Reels-like experience on mobile
  if (isMobile) {
    return (
      <MobileReelsView 
        currentId={id || ''}
        videos={adjacentVideos}
        currentIndex={currentIndex}
        onClose={handleClose}
        globalAudioEnabled={globalAudioEnabled}
        onAudioStateChange={handleAudioStateChange}
      />
    );
  }

  // Desktop experience - product links will be shown in the right sidebar
  return (
    <>
      <Swipeable 
        onSwipe={handleSwipe} 
        threshold={100} 
        className="min-h-screen bg-white dark:bg-dm-background flex flex-col touch-manipulation relative py-12 md:py-16"
      >
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleClose}
            className="rounded-full bg-black/30 border-none hover:bg-black/50 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <main className="mx-auto h-full max-w-[600px] flex items-center justify-center">
          <div className="w-full h-full relative">
            <VideoPlayer 
              video={video} 
              autoPlay={true} 
              showControls={false} 
              isFullscreen={false}
              className="w-full h-full" 
              onClick={handleClose}
              onNaturalAspectRatioChange={handleNaturalAspectRatioChange}
              onTimeUpdate={handleTimeUpdate}
            />
            
            {/* Video progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <Progress value={progress} className="h-1 rounded-none bg-white/20" />
            </div>
          </div>
        </main>
      </Swipeable>

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

export default ExploreDetail;
