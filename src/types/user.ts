
export type UserRole = "user" | "admin" | "super_admin";

export type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  account_status: string;
  user_roles: {
    id: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
  }[];
};
