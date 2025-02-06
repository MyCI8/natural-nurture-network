
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./users/UserList";
import { RoleSettings } from "./users/RoleSettings";
import { supabase } from "@/integrations/supabase/client";

const ManageUsersComponent = () => {
  const [activeTab, setActiveTab] = useState("users");

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          account_status,
          user_roles (
            role
          )
        `);

      if (error) throw error;
      return profiles;
    },
  });

  const { data: roleSettings, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roleSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_settings")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
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
