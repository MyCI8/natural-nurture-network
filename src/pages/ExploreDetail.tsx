
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/video/VideoPlayer';
import { useLayout } from '@/contexts/LayoutContext';
import Comments from '@/components/video/Comments';

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

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return { ...data, id: user.id };
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
    <div className="max-w-screen-sm mx-auto min-h-screen bg-white dark:bg-gray-900">
      <div className="overflow-hidden rounded-lg">
        <VideoPlayer 
          video={video} 
          autoPlay={false} 
          showControls 
          onClose={handleClose}
        />
      </div>
      
      <div className="mt-2">
        <Comments videoId={id || ''} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ExploreDetail;
