
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
import { toast } from 'sonner';
import { VideoLoadingState, VideoErrorState } from '@/components/explore/VideoLoadingState';
import { isPlayableVideoFormat, logVideoInfo } from '@/components/video/utils/videoPlayerUtils';
import { isCarousel } from '@/utils/videoUtils';

// Helper function to convert raw Supabase data to our Video type
const mapSupabaseDataToVideo = (data: any): Video => {
  return {
    id: data.id,
    title: data.title || '',
    description: data.description || '',
    video_url: data.video_url,
    thumbnail_url: data.thumbnail_url,
    creator_id: data.creator_id,
    status: data.status || 'published',
    views_count: data.views_count || 0,
    likes_count: data.likes_count || 0,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    video_type: data.video_type || 'general',
    related_article_id: data.related_article_id || null,
    creator: data.creator || null,
    show_in_latest: data.show_in_latest || false,
    media_files: data.media_files || null,
    is_carousel: data.is_carousel || false
  };
};

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection, setIsInReelsMode } = useLayout();
  const { toast: hookToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState<string | null>(null);

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

  const { data: video, isLoading: isVideoLoading, error: videoError, refetch: refetchVideo } = useQuery({
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

      // Map the Supabase data to our Video type
      const videoData = mapSupabaseDataToVideo(data);

      // Validate video URL
      if (!videoData.video_url && (!videoData.media_files || videoData.media_files.length === 0)) {
        setVideoLoadError("No media content available");
        toast("This content is unavailable");
      } else {
        // Log video details for debugging
        logVideoInfo(videoData, "Loaded video:");
        
        // Check if this is an image carousel
        if (videoData.media_files && videoData.media_files.length > 0) {
          console.log(`Loaded carousel with ${videoData.media_files.length} images`);
        }
        // Check if the video format is supported
        else if (videoData.video_url && !isPlayableVideoFormat(videoData.video_url)) {
          console.warn(`Video may not be playable: ${videoData.video_url}`);
          // Still continue - the player will try its best
        }
      }
      
      return videoData;
    },
    enabled: !!id,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error("Error loading video:", error);
          toast("Failed to load video data");
          setVideoLoadError("Could not load video data");
        }
      }
    }
  });

  const { data: adjacentVideosRaw = [], isLoading: isAdjacentLoading } = useQuery({
    queryKey: ['adjacent-videos', id],
    queryFn: async () => {
      if (!id) return [];
      
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
        .not('video_type', 'eq', 'news')
        .filter('status', 'eq', 'published')
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      // Log the first few videos for debugging
      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} adjacent videos.`);
        data.slice(0, 3).forEach(vid => logVideoInfo(mapSupabaseDataToVideo(vid), "Adjacent video:"));
      }
      
      return data;
    },
    enabled: !!id,
    meta: {
      onSettled: (data, error) => {
        if (error) {
          console.error("Error loading adjacent videos:", error);
          toast("Failed to load related videos");
        }
      }
    }
  });

  // Map the raw adjacent videos to our Video type
  const adjacentVideos = adjacentVideosRaw.map(mapSupabaseDataToVideo);
  
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

  const handleRetry = () => {
    // Reset error states
    setVideoLoadError(null);
    
    // Retry loading the video
    refetchVideo();
    
    // Reset loading state
    setIsLoading(true);
  };

  useEffect(() => {
    // Reset progress when video changes
    setProgress(0);
    setIsLoading(true);
    setVideoLoadError(null);
  }, [id]);

  // Loading state
  if (isVideoLoading) {
    return <VideoLoadingState />;
  }

  // Error state
  if (videoError || !video || videoLoadError) {
    return <VideoErrorState 
      message={videoLoadError || "Could not load the video"} 
      onRetry={handleRetry}
    />;
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

  // Desktop experience
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
            autoPlay={!isCarousel(video.media_files)} 
            showControls={false} 
            isFullscreen={false} 
            className="w-full rounded-md overflow-hidden" 
            objectFit="contain"
            useAspectRatio={true}
            onClick={handleClose}
          />
          
          {/* Video progress bar - only show for actual videos, not carousels */}
          {!isCarousel(video.media_files) && video.video_url && (
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <Progress value={progress} className="h-1 rounded-none bg-white/20" />
            </div>
          )}
        </div>
      </div>
    </Swipeable>
  );
};

export default ExploreDetail;
