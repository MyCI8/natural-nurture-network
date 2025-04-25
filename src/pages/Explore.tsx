
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileVideoFeed from '@/components/video/MobileVideoFeed';
import type { Video } from '@/types/video';
import VideoDialog from '@/components/video/VideoDialog';

const Explore = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const isMobile = useIsMobile();
  const [globalAudioEnabled, setGlobalAudioEnabled] = useState(false);

  // Fetch user-uploaded videos
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          creator:creator_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'published')
        .not('video_url', 'like', '%youtu%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });

  // Fetch current user
  const { data: currentUserData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user || null;
    },
  });

  // Fetch user likes
  const { data: userLikeIds } = useQuery({
    queryKey: ['userLikes', currentUserData?.id],
    queryFn: async () => {
      if (!currentUserData) return [];
      const { data, error } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', currentUserData.id);

      if (error) throw error;
      return data.map(like => like.video_id);
    },
    enabled: !!currentUserData,
  });

  // Convert likes array to Record for MobileVideoFeed component
  const userLikes: Record<string, boolean> = {};
  if (userLikeIds) {
    userLikeIds.forEach(id => {
      userLikes[id] = true;
    });
  }

  const handleLike = async (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUserData) {
      navigate('/auth');
      return;
    }

    const isLiked = userLikeIds?.includes(videoId);
    try {
      if (isLiked) {
        await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', currentUserData.id)
          .eq('video_id', videoId);
      } else {
        await supabase
          .from('video_likes')
          .insert({ user_id: currentUserData.id, video_id: videoId });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAudioStateChange = (isEnabled: boolean) => {
    setGlobalAudioEnabled(isEnabled);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:text-dm-text">
        Loading...
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load videos. Please try again.",
      variant: "destructive",
    });
    return null;
  }

  if (isMobile && videos) {
    return (
      <MobileVideoFeed
        videos={videos}
        userLikes={userLikes}
        onLikeToggle={handleLike}
        currentUser={currentUserData}
        globalAudioEnabled={globalAudioEnabled}
        onAudioStateChange={handleAudioStateChange}
      />
    );
  }

  // Desktop view removed - you can add it back if needed
  return null;
};

export default Explore;
