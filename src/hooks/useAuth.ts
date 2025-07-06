
import { useQuery } from '@tanstack/react-query';
export const useAuth = () => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return session?.user || null;
    },
  });

  return { currentUser, isLoading };
};
