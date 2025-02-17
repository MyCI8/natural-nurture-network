
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Video } from '@/types/video';

interface SavedVideosProps {
  userId: string;
}

export const SavedVideos = ({ userId }: SavedVideosProps) => {
  const navigate = useNavigate();

  const { data: savedVideos, isLoading } = useQuery({
    queryKey: ['savedVideos', userId],
    queryFn: async () => {
      // First, get all the videos for this user
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*, saved_posts!inner(*)')
        .eq('saved_posts.user_id', userId)
        .eq('status', 'published');

      if (error) throw error;
      return videos as Video[];
    },
  });

  if (isLoading) {
    return <div>Loading saved videos...</div>;
  }

  if (!savedVideos?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No saved videos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
      {savedVideos.map((video) => (
        <div
          key={video.id}
          className="relative aspect-square cursor-pointer"
          onClick={() => navigate(`/videos/${video.id}`)}
        >
          <img
            src={video.thumbnail_url || '/placeholder.svg'}
            alt={video.title}
            className="object-cover w-full h-full"
          />
        </div>
      ))}
    </div>
  );
};
