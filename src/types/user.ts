
export type UserRole = "user" | "admin" | "super_admin";

export type Permission = {
  can_manage_roles?: boolean;
  can_manage_users?: boolean;
  can_manage_content?: boolean;
  can_manage_settings?: boolean;
  can_comment?: boolean;
  can_view_content?: boolean;
};

export type RoleSetting = {
  id: string;
  role: UserRole;
  permissions: Permission;
  created_at: string;
  updated_at: string;
};

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
