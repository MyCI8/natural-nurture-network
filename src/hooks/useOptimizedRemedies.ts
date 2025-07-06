
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";

// Optimized remedy data structure - only fetch what we need
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
  likes: Set<string>;
  saves: Set<string>;
}

interface RemedyRating {
  remedy_id: string;
  rating: number;
  user_id: string;
}

export const useOptimizedRemedies = () => {
  const { currentUser } = useAuth();

  // Optimized remedies query - only published remedies with selective fields
  const { data: remedies = [], isLoading: remediesLoading, error: remediesError } = useQuery({
    queryKey: ['optimized-remedies'],
    queryFn: async (): Promise<OptimizedRemedyData[]> => {
      console.log('Fetching optimized remedies...');
      const { data, error } = await supabase
        .from('remedies')
        .select('id, name, summary, image_url, status, created_at, click_count')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching optimized remedies:', error);
        throw error;
      }
      
      console.log('Optimized remedies fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Combined user interactions query - fetch likes and saves in one go
  const { data: userInteractions } = useQuery({
    queryKey: ['user-interactions', currentUser?.id],
    queryFn: async (): Promise<UserInteractionData> => {
      if (!currentUser) {return { likes: new Set(), saves: new Set() };}

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

      const likes = new Set(likesResult.data?.map(like => like.remedy_id) || []);
      const saves = new Set(savesResult.data?.map(save => save.remedy_id) || []);

      return { likes, saves };
    },
    enabled: !!currentUser,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Only fetch ratings for visible remedies
  const visibleRemedyIds = useMemo(() => remedies.map(r => r.id), [remedies]);
  
  const { data: ratings = [] } = useQuery({
    queryKey: ['remedy-ratings', visibleRemedyIds],
    queryFn: async (): Promise<RemedyRating[]> => {
      if (visibleRemedyIds.length === 0) {return [];}
      
      const { data, error } = await supabase
        .from('remedy_ratings')
        .select('remedy_id, rating, user_id')
        .in('remedy_id', visibleRemedyIds);
      
      if (error) {
        console.error('Error fetching ratings:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: visibleRemedyIds.length > 0,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 6 * 60 * 1000, // 6 minutes
  });

  // Memoized rating calculations
  const { remedyRatings, userRated } = useMemo(() => {
    const remedyRatings: Record<string, { average: number; count: number }> = {};
    const userRated: Record<string, number> = {};
    
    if (ratings.length > 0) {
      const byRemedy: Record<string, number[]> = {};
      
      ratings.forEach((r) => {
        if (!byRemedy[r.remedy_id]) {byRemedy[r.remedy_id] = [];}
        byRemedy[r.remedy_id].push(Number(r.rating));
        
        if (currentUser && r.user_id === currentUser.id) {
          userRated[r.remedy_id] = r.rating;
        }
      });
      
      Object.entries(byRemedy).forEach(([remedyId, ratingsList]) => {
        remedyRatings[remedyId] = {
          average: ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length,
          count: ratingsList.length,
        };
      });
    }
    
    return { remedyRatings, userRated };
  }, [ratings, currentUser]);

  return {
    remedies,
    isLoading: remediesLoading,
    error: remediesError,
    userLikes: userInteractions?.likes || new Set(),
    userSaves: userInteractions?.saves || new Set(),
    remedyRatings,
    userRated,
  };
};
