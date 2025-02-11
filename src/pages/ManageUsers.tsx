
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/user";

const ManageUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      console.log("Starting user fetch with filters:", { searchQuery, roleFilter, statusFilter });
      
      let query = supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          account_status,
          last_login_at,
          user_roles (
            role
          )
        `);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      if (roleFilter !== "all") {
        query = query.eq("user_roles.role", roleFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("account_status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      console.log("Raw data from Supabase:", data);

      const mappedUsers = data.map(user => {
        console.log("Processing user:", user);
        return {
          ...user,
          email: user.email || 'N/A', // Add fallback for empty emails
          role: user.user_roles?.[0]?.role || 'user',
          account_status: user.account_status || 'inactive'
        };
      });

      console.log("Mapped users:", mappedUsers);
      return mappedUsers;
    },
  });

  const handleEditUser = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "inactive" })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been deactivated.",
      });
    } catch (error) {
      console.error("Error deactivating user:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">User Management</h2>
            <Button onClick={() => navigate("/admin/users/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          <UserFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading users...</p>
            </div>
          ) : (
            <UserTable
              users={users || []}
              onEditUser={handleEditUser}
              onDeactivateUser={handleDeactivateUser}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
