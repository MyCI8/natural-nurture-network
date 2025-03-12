
import type { Database } from "@/integrations/supabase/types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role?: UserRole;
  account_status?: "active" | "inactive";
  last_login_at?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
};

export type UserWithProfile = User & {
  profile: Profile | null;
};

export type UserProfileData = {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  posts?: Array<{
    id: string;
    thumbnail_url?: string;
  }>;
}
