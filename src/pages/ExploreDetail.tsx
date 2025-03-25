
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
    <div className="max-w-[1200px] mx-auto min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col">
        <div className="w-full p-4 sm:p-2">
          <div className="instagram-dialog-video py-2 max-w-[400px] mx-auto">
            <VideoPlayer 
              video={video} 
              autoPlay={false} 
              showControls 
              onClose={handleClose}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreDetail;
