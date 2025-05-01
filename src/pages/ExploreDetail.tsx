import React, { useEffect, useState, useRef } from 'react';
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

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);

  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(false);
  }, [setShowRightSection]);

  const handleClose = () => {
    // Always navigate back to explore page
    navigate('/explore');
  };

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
        .limit(10);
        
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
    if (direction === 'down' || direction === 'right') {
      handleClose();
      return;
    }
    
    if (direction === 'up' && currentIndex < adjacentVideos.length - 1) {
      // Navigate to next video
      const nextVideo = adjacentVideos[currentIndex + 1];
      if (nextVideo) {
        navigate(`/explore/${nextVideo.id}`, { replace: true });
      }
    } else if (direction === 'down' && currentIndex > 0) {
      // Navigate to previous video
      const prevVideo = adjacentVideos[currentIndex - 1];
      if (prevVideo) {
        navigate(`/explore/${prevVideo.id}`, { replace: true });
      }
    }
  };

  const handleAudioStateChange = (isMuted: boolean) => {
    setGlobalAudioEnabled(!isMuted);
  };

  useEffect(() => {
    // Reset progress when video changes
    setProgress(0);
    setIsLoading(true);
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
        currentVideo={video} 
        adjacentVideos={adjacentVideos}
        currentIndex={currentIndex}
        onClose={handleClose}
        globalAudioEnabled={globalAudioEnabled}
        onAudioStateChange={handleAudioStateChange}
        onSwipeNavigate={handleSwipe}
      />
    );
  }

  // Desktop experience remains unchanged
  return (
    <Swipeable 
      onSwipe={handleSwipe} 
      threshold={100} 
      className="min-h-screen bg-white dark:bg-dm-background flex flex-col touch-manipulation relative"
    >
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={handleClose}
          className="rounded-full bg-black/30 border-none hover:bg-black/50 text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative py-2 px-2 md:py-4 md:px-4">
        <div className="w-full max-w-3xl bg-black rounded-lg overflow-hidden p-2.5 min-h-[200px] flex items-center justify-center relative">
          <VideoPlayer 
            video={video} 
            productLinks={[]} 
            autoPlay={true} 
            showControls={false} 
            isFullscreen={false} 
            className="w-full rounded-md overflow-hidden" 
            objectFit="contain"
            useAspectRatio={true}
            onClick={handleClose}
          />
          
          {/* Video progress bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <Progress value={progress} className="h-1 rounded-none bg-white/20" />
          </div>
        </div>
      </div>
      
      {adjacentVideos.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="text-white bg-black/30 px-3 py-1 rounded-full text-xs">
            {currentIndex + 1} / {adjacentVideos.length}
          </div>
        </div>
      )}
    </Swipeable>
  );
};

export default ExploreDetail;
