import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Swipeable } from '@/components/ui/swipeable';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  const { toast } = useToast();

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

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'down' || direction === 'right') {
      handleClose();
    }
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <Swipeable 
      onSwipe={handleSwipe} 
      threshold={100} 
      className="min-h-screen bg-white dark:bg-dm-background flex flex-col touch-manipulation relative"
    >
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center relative py-2 px-2 md:py-4 md:px-4">
        {/* Close Button - Placed on top right */}
        <div className="absolute top-4 right-4 z-20">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full bg-black/50 text-white hover:bg-black/70 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Video Content with min 10px padding and aspect ratio */}
        <div className="w-full max-w-3xl bg-black rounded-lg overflow-hidden p-2.5 min-h-[200px] flex items-center justify-center">
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
        </div>
      </div>
    </Swipeable>
  );
};

export default ExploreDetail;
