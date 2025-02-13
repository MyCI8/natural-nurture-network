
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
};

export type UserWithProfile = User & {
  profile: Profile | null;
};
