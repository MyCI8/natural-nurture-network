
import { QueryClient } from "@tanstack/react-query";

export const invalidateAuthQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
};
