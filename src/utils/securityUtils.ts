
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/types/user";

/**
 * Check if the current user has admin privileges
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_is_admin');
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Check if user has specific role
 */
export const checkUserRole = async (userId: string, roles: UserRole[]): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_user_role', {
      _checking_user_id: userId,
      required_roles: roles
    });
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    return data || false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};
