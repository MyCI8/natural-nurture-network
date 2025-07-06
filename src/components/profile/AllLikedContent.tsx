import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Video } from '@/types/video';
import { Skeleton } from '@/components/ui/skeleton';
import { Tables } from '@/integrations/supabase/types';
import { isYoutubeVideo, isImagePost } from '@/utils/videoUtils';

type LikedRemedy = {
  id: string;
  created_at: string;
  remedy: Tables<'remedies'> | null;
};
type LikedVideo = {
  id: string;
  created_at: string;
  video: Video | null;
};

type MergedLikedItem =
  | ({ type: 'remedy' } & LikedRemedy)
  | ({ type: 'video' } & LikedVideo);

interface AllLikedContentProps {
  userId: string;
}

export const AllLikedContent = ({ userId }: AllLikedContentProps) => {
  const navigate = useNavigate();

  // Remedies liked by the user
  const { data: likedRemedies, isLoading: loadingRemedies } = useQuery({
    queryKey: ['allLikedRemedies', userId],
    queryFn: async () => {
      if (!userId) {return [];}
      const { data, error } = await supabase
        .from('remedy_likes')
        .select(`
          id,
          created_at,
          remedy:remedies(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching liked remedies:", error.message);
        return [];
      }
      return (data as LikedRemedy[])?.filter(lr => lr.remedy !== null) ?? [];
    },
    enabled: !!userId,
  });

  // Videos liked by the user
  const { data: likedVideos, isLoading: loadingVideos } = useQuery({
    queryKey: ['allLikedVideos', userId],
    queryFn: async () => {
      if (!userId) {return [];}
      const { data, error } = await supabase
        .from('video_likes')
        .select(`
          id,
          created_at,
          video:videos(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching liked videos:", error.message);
        return [];
      }
      return (data as LikedVideo[]).filter(v => v.video && v.video.status === "published");
    },
    enabled: !!userId,
  });

  const isLoading = loadingRemedies || loadingVideos;

  // Merge & sort both content types by like time
  const allItems: MergedLikedItem[] = [
    ...(likedRemedies?.map(r => ({ ...r, type: 'remedy' as const })) ?? []),
    ...(likedVideos?.map(v => ({ ...v, type: 'video' as const })) ?? []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Helper function to get the correct thumbnail URL
  const getThumbnailUrl = (item: MergedLikedItem) => {
    if (item.type === "remedy") {
      return item.remedy?.image_url || "/placeholder.svg";
    }

    const video = item.video;
    if (!video) {return "/placeholder.svg";}
    
    // For image posts, use video_url as the image source
    if (isImagePost(video.video_url || '')) {
      return video.video_url || "/placeholder.svg";
    }
    
    // For YouTube videos, generate thumbnail
    if (isYoutubeVideo(video.video_url || '')) {
      const getYouTubeThumbnail = (url: string): string => {
        try {
          let videoId = "";
          if (url.includes("youtube.com/watch")) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get("v") || "";
          } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
          }
          
          if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        } catch (error) {
          console.error("Error parsing YouTube URL:", error);
        }
        return "/placeholder.svg";
      };
      
      return getYouTubeThumbnail(video.video_url || '');
    }
    
    // For regular videos, use thumbnail_url if available, otherwise fallback
    return video.thumbnail_url || "/placeholder.svg";
  };

  // Helper function to get media type icon
  const getMediaTypeIcon = (item: MergedLikedItem) => {
    if (item.type === "remedy") {
      return null; // No icon for remedies
    }

    const video = item.video;
    if (!video) {return null;}
    
    if (isImagePost(video.video_url || '')) {
      return <ImageIcon className="h-4 w-4 text-white" />;
    }
    
    if (isYoutubeVideo(video.video_url || '') || video.video_url?.includes('.mp4')) {
      return <Play className="h-4 w-4 text-white" />;
    }
    
    return null;
  };

  // Helper function to determine if item should show text overlay
  const shouldShowTextOverlay = (item: MergedLikedItem) => {
    if (item.type === "remedy") {
      return true; // Always show text for remedies
    }
    
    // Show text for news videos only
    return item.video?.video_type === "news";
  };

  // Helper function to get overlay text
  const getOverlayText = (item: MergedLikedItem) => {
    if (item.type === "remedy") {
      return item.remedy?.name || "";
    }
    
    if (item.type === "video" && item.video?.video_type === "news") {
      return item.video.title || "";
    }
    
    return "";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (!allItems.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No liked content</h3>
        <p className="text-muted-foreground">All your liked videos and remedies will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {allItems.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square cursor-pointer group"
          onClick={() => {
            if (item.type === "video") {
              navigate(`/videos/${item.video?.id}`);
            } else {
              navigate(`/remedies/${item.remedy?.id}`);
            }
          }}
        >
          <img
            src={getThumbnailUrl(item)}
            alt={item.type === "video" ? item.video?.title : item.remedy?.name}
            className="w-full h-full object-cover rounded-sm"
          />
          
          {/* Media type indicator - only show on hover for videos without text overlay */}
          {!shouldShowTextOverlay(item) && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-sm flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {getMediaTypeIcon(item)}
              </div>
            </div>
          )}

          {/* Text overlay for News and Remedies */}
          {shouldShowTextOverlay(item) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-sm">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h4 className="text-white text-xs font-medium line-clamp-2 leading-tight">
                  {getOverlayText(item)}
                </h4>
              </div>
              {/* Media type indicator for videos with text overlay */}
              {item.type === "video" && (
                <div className="absolute top-2 right-2 opacity-80">
                  {getMediaTypeIcon(item)}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
