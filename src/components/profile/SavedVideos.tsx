
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
      const { data, error } = await supabase
        .from('saved_posts')
        .select('video:videos(*)')
        .eq('user_id', userId);

      if (error) throw error;

      // Extract video objects from the query result
      const videos = data?.map((item) => item.video) as Video[];
      
      // Filter out any null values and only return published videos
      return videos.filter((video): video is Video => 
        video !== null && video.status === 'published'
      );
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
