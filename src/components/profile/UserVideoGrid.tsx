
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Video } from '@/types/video';
import VideoModal from '@/components/video/VideoModal';
import { PostContextMenu } from './PostContextMenu';

interface UserVideoGridProps {
  userId: string;
}

export const UserVideoGrid = ({ userId }: UserVideoGridProps) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Get current user to check ownership
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['userVideos', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('creator_id', userId)
        .in('status', ['published', 'archived']) // Include archived for owners
        .neq('video_type', 'news')
        .order('created_at', { ascending: false });

      if (error) {throw error;}
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

  const isOwner = currentUser?.id === userId;

  // Filter out archived posts unless it's the owner
  const displayVideos = isOwner ? videos : videos.filter(video => video.status === 'published');

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {displayVideos.map((video) => (
          <PostContextMenu
            key={video.id}
            postId={video.id}
            postTitle={video.title}
            isOwner={isOwner}
          >
            <div
              className={`relative aspect-square cursor-pointer group touch-manipulation ${
                video.status === 'archived' ? 'opacity-60' : ''
              }`}
              onClick={() => setSelectedVideo(video)}
            >
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <video
                    src={video.video_url}
                    className="object-cover w-full h-full"
                    preload="metadata"
                  />
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-sm p-2 text-center line-clamp-2">
                  {video.title}
                </p>
              </div>

              {/* Archived indicator */}
              {video.status === 'archived' && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Archived
                </div>
              )}
            </div>
          </PostContextMenu>
        ))}
      </div>

      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
};
