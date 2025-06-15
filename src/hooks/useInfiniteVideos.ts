
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Video } from '@/types/video';

const VIDEOS_PER_PAGE = 10;

const fetchVideos = async ({ pageParam = 0 }: { pageParam?: number }) => {
  const from = pageParam * VIDEOS_PER_PAGE;
  const to = from + VIDEOS_PER_PAGE - 1;

  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:creator_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return data as (Video & { profiles: { id: string; full_name: string; avatar_url: string | null } })[];
};

export const useInfiniteVideos = () => {
  return useInfiniteQuery({
    queryKey: ['videos'],
    queryFn: fetchVideos,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < VIDEOS_PER_PAGE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};
