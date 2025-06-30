
import { QueryClient } from "@tanstack/react-query";
import { checkIsAdmin } from "./securityUtils";

export const invalidateAuthQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
};

/**
 * Enhanced auth utility with admin check
 */
export const getAuthState = async () => {
  const isAdmin = await checkIsAdmin();
  return { isAdmin };
};
