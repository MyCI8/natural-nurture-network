
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search } from "lucide-react";

type UserRole = "user" | "admin" | "super_admin";

type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  account_status: string;
  user_roles: Array<{ role: UserRole }>;
};

interface UserListProps {
  users: User[];
  isLoading: boolean;
}

export const UserList = ({ users, isLoading }: UserListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);

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
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

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
                <Avatar className="h-10 w-10">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || ""} />
                  ) : (
                    <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary font-semibold">
                      {(user.full_name || "U")[0]}
                    </div>
                  )}
                </Avatar>
                <span>{user.full_name || "Unnamed User"}</span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.account_status}
                  onValueChange={(value) => {
                    updateStatusMutation.mutate({ userId: user.id, status: value });
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <Badge variant="default">Active</Badge>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <Badge variant="secondary">Suspended</Badge>
                    </SelectItem>
                    <SelectItem value="pending">
                      <Badge variant="outline">Pending</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.user_roles[0]?.role || "user"}
                  onValueChange={(value: UserRole) => {
                    updateRoleMutation.mutate({ userId: user.id, role: value });
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
