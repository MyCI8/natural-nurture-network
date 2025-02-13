
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { User, UserRole } from '@/types/user';

const SUPABASE_URL = "https://tdnuswekfcjgvqyiotoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkbnVzd2VrZmNqZ3ZxeWlvdG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzg4ODIsImV4cCI6MjA1Mzg1NDg4Mn0.JSfw_eiWrKaiPhxIaqSX_G1BTuFrpMn25IFpROASEZ0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserRole = async (): Promise<UserRole | null> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .single();
    
  if (error || !data) return null;
  return data.role;
};

export const isAdmin = async (): Promise<boolean> => {
  const role = await getUserRole();
  return role === 'admin' || role === 'super_admin';
};
