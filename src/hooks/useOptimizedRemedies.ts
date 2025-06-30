
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OptimizedRemedyData {
  id: string;
  name: string;
  summary: string;
  image_url: string;
  status: string;
  created_at: string;
  click_count: number;
}

interface UserInteractionData {
  likedRemedies: Set<string>;
  savedRemedies: Set<string>;
}

export const useOptimizedRemedies = (searchTerm: string = '') => {
  const { currentUser } = useAuth();

  // Fetch remedies with optimized query
  const remediesQuery = useQuery({
    queryKey: ['optimized-remedies', searchTerm],
    queryFn: async (): Promise<OptimizedRemedyData[]> => {
      let query = supabase
        .from('remedies')
        .select('id, name, summary, image_url, status, created_at, click_count')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user interactions in a single optimized query
  const userInteractionsQuery = useQuery({
    queryKey: ['user-interactions', currentUser?.id],
    queryFn: async (): Promise<UserInteractionData> => {
      if (!currentUser?.id) {
        return { likedRemedies: new Set(), savedRemedies: new Set() };
      }

      const [likesResult, savesResult] = await Promise.all([
        supabase
          .from('remedy_likes')
          .select('remedy_id')
          .eq('user_id', currentUser.id),
        supabase
          .from('saved_remedies')
          .select('remedy_id')
          .eq('user_id', currentUser.id)
      ]);

      return {
        likedRemedies: new Set(likesResult.data?.map(like => like.remedy_id) || []),
        savedRemedies: new Set(savesResult.data?.map(save => save.remedy_id) || [])
      };
    },
    enabled: !!currentUser?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch ratings only for visible remedies
  const visibleRemedyIds = remediesQuery.data?.map(r => r.id) || [];
  const ratingsQuery = useQuery({
    queryKey: ['remedy-ratings-optimized', visibleRemedyIds],
    queryFn: async () => {
      if (visibleRemedyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('remedy_ratings')
        .select('remedy_id, rating, user_id')
        .in('remedy_id', visibleRemedyIds);

      if (error) throw error;
      return data || [];
    },
    enabled: visibleRemedyIds.length > 0,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Process ratings data
  const processedRatings = React.useMemo(() => {
    if (!ratingsQuery.data) return { remedyRatings: {}, userRated: {} };

    const remedyRatings: Record<string, { average: number; count: number }> = {};
    const userRated: Record<string, number> = {};

    const ratingsByRemedy: Record<string, number[]> = {};
    
    ratingsQuery.data.forEach((rating: any) => {
      if (!ratingsByRemedy[rating.remedy_id]) {
        ratingsByRemedy[rating.remedy_id] = [];
      }
      ratingsByRemedy[rating.remedy_id].push(Number(rating.rating));

      if (currentUser && rating.user_id === currentUser.id) {
        userRated[rating.remedy_id] = rating.rating;
      }
    });

    Object.entries(ratingsByRemedy).forEach(([remedyId, ratings]) => {
      remedyRatings[remedyId] = {
        average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
        count: ratings.length,
      };
    });

    return { remedyRatings, userRated };
  }, [ratingsQuery.data, currentUser]);

  return {
    remedies: remediesQuery.data || [],
    userInteractions: userInteractionsQuery.data || { likedRemedies: new Set(), savedRemedies: new Set() },
    ratings: processedRatings,
    isLoading: remediesQuery.isLoading,
    error: remediesQuery.error || userInteractionsQuery.error || ratingsQuery.error,
  };
};
