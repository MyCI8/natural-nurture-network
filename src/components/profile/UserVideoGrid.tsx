
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Video } from '@/types/video';

interface UserVideoGridProps {
  userId: string;
}

export const UserVideoGrid = ({ userId }: UserVideoGridProps) => {
  const navigate = useNavigate();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['userVideos', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('creator_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });

  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  if (!videos?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
      {videos.map((video) => (
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
