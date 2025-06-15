
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

const REMEDIES_PER_PAGE = 10;

type Remedy = Tables<'remedies'>;

const fetchRemedies = async ({ pageParam = 0, searchTerm = '' }: { pageParam?: number, searchTerm?: string }) => {
  const from = pageParam * REMEDIES_PER_PAGE;
  const to = from + REMEDIES_PER_PAGE - 1;

  let query = supabase
    .from("remedies")
    .select("*")
    .in("status", ["published", "draft"])
    .order("created_at", { ascending: false })
    .range(from, to);
  
  if (searchTerm) {
    const searchFilter = `name.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,brief_description.ilike.%${searchTerm}%`;
    query = query.or(searchFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching remedies:', error);
    throw error;
  }

  return (data as Remedy[]) || [];
};

export const useInfiniteRemedies = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ['remedies', searchTerm],
    queryFn: ({ pageParam }) => fetchRemedies({ pageParam, searchTerm }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < REMEDIES_PER_PAGE) {
        return undefined;
      }
      return allPages.length;
    },
    initialPageParam: 0,
  });
};
