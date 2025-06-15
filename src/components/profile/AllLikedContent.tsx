
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Video } from '@/types/video';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tables } from '@/integrations/supabase/types';

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

interface AllLikedContentProps {
  userId: string;
}

export const AllLikedContent = ({ userId }: AllLikedContentProps) => {
  const navigate = useNavigate();

  // Remedies liked by the user
  const { data: likedRemedies, isLoading: loadingRemedies } = useQuery({
    queryKey: ['allLikedRemedies', userId],
    queryFn: async () => {
      if (!userId) return [];
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
      if (!userId) return [];
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
  const allItems = [
    ...(likedRemedies?.map(r => ({ ...r, type: 'remedy' })) ?? []),
    ...(likedVideos?.map(v => ({ ...v, type: 'video' })) ?? []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
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
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {allItems.map((item) => {
        if (item.type === 'remedy') {
          // Remedy card
          const remedy = item.remedy;
          if (!remedy) return null;
          return (
            <Card
              key={item.id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full cursor-pointer"
              onClick={() => navigate(`/remedies/${remedy.id}`)}
            >
              <CardContent className="p-0 h-full">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={remedy.image_url || '/placeholder.svg'}
                    alt={remedy.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 p-1 rounded-full">
                    <Heart className="h-3 w-3 fill-white text-white" />
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-1 text-[12px] font-medium">
                    Remedy
                  </div>
                  <div className="font-semibold text-xs line-clamp-2 group-hover:text-primary">{remedy.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{remedy.summary}</div>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          // Video card
          const video = item.video;
          if (!video) return null;
          return (
            <Card
              key={item.id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full cursor-pointer"
              onClick={() => navigate(`/videos/${video.id}`)}
            >
              <CardContent className="p-0 h-full">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail_url || '/placeholder.svg'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-primary p-1 rounded-full">
                    <Heart className="h-3 w-3 fill-white text-white" />
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <div className="flex items-center gap-1 text-[12px] font-medium">
                    Video
                  </div>
                  <div className="font-semibold text-xs line-clamp-2 group-hover:text-primary">{video.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{video.description}</div>
                </div>
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
};
