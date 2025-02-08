
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, UserRole } from "@/types/user";
import { UserSearch } from "./UserSearch";
import { UserAvatar } from "./UserAvatar";
import { UserStatusSelect } from "./UserStatusSelect";
import { UserRoleSelect } from "./UserRoleSelect";

interface UserListProps {
  users: User[];
  isLoading: boolean;
}

export const UserList = ({ users, isLoading }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId, role }: { userId: string; roleId: string; role: UserRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: status })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    },
  });

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UserSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center space-x-4">
                <UserAvatar avatarUrl={user.avatar_url} fullName={user.full_name} />
                <span>{user.full_name || "Unnamed User"}</span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <UserStatusSelect
                  status={user.account_status}
                  onStatusChange={(value) => {
                    updateStatusMutation.mutate({ userId: user.id, status: value });
                  }}
                />
              </TableCell>
              <TableCell>
                {user.user_roles[0] && (
                  <UserRoleSelect
                    role={user.user_roles[0].role}
                    onRoleChange={(value) => {
                      updateRoleMutation.mutate({
                        userId: user.id,
                        roleId: user.user_roles[0].id,
                        role: value
                      });
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
