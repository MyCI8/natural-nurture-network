
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';

const ExploreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setShowRightSection } = useLayout();
  
  // Always show right section when on the explore detail page
  useEffect(() => {
    setShowRightSection(true);
    return () => setShowRightSection(true); // Keep it visible on unmount too
  }, [setShowRightSection]);

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
      
      // Ensure related_article_id is included
      return {
        ...data,
        related_article_id: data.related_article_id || null
      };
    },
  });

  const handleClose = () => {
    navigate('/explore');
  };

  if (isVideoLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!video) {
    return <div className="flex items-center justify-center min-h-screen">Video not found</div>;
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <VideoPlayer 
        video={video} 
        autoPlay={true} 
        showControls 
        onClose={handleClose}
        isFullscreen={true}
        className="h-screen w-full"
        objectFit="contain"
        useAspectRatio={false}
      />
    </div>
  );
};

export default ExploreDetail;
