
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
      const { data: saved, error: savedError } = await supabase
        .from('saved_posts')
        .select('video_id')
        .eq('user_id', userId);

      if (savedError) throw savedError;

      if (!saved.length) return [];

      const videoIds = saved.map(s => s.video_id);
      
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds)
        .eq('status', 'published');

      if (videosError) throw videosError;
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
