
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./users/UserList";
import { RoleSettings } from "./users/RoleSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, RoleSetting } from "@/types/user";

const ManageUsersComponent = () => {
  const [activeTab, setActiveTab] = useState("users");

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        // First fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, account_status");

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          toast.error("Failed to fetch users");
          throw profilesError;
        }

        // Then fetch user roles for each profile
        const profilesWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: userRoles, error: rolesError } = await supabase
              .from("user_roles")
              .select("id, role, created_at, updated_at")
              .eq("user_id", profile.id);

            if (rolesError) {
              console.error("Error fetching user roles:", rolesError);
              return {
                ...profile,
                user_roles: [],
              };
            }

            return {
              ...profile,
              user_roles: userRoles || [],
            };
          })
        );

        return profilesWithRoles as User[];
      } catch (error) {
        console.error("Error in query function:", error);
        toast.error("Failed to fetch users");
        throw error;
      }
    },
  });

  const { data: roleSettings, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roleSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_settings")
        .select("*")
        .order('role');

      if (error) {
        console.error("Error fetching role settings:", error);
        toast.error("Failed to fetch role settings");
        throw error;
      }

      // Convert JSON permissions to proper type
      return (data || []).map(setting => ({
        ...setting,
        permissions: setting.permissions as unknown as Permission
      })) as RoleSetting[];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, their roles, and permissions
        </p>
      </div>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserList users={users || []} isLoading={isLoadingUsers} />
        </TabsContent>
        
        <TabsContent value="roles">
          <RoleSettings settings={roleSettings || []} isLoading={isLoadingRoles} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageUsersComponent;
