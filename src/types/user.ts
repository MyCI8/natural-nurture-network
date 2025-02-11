
export type UserRole = "user" | "admin" | "super_admin";

export type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role?: UserRole;
  account_status?: "active" | "inactive";
  last_login_at?: string;
};
