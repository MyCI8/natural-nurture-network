
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserRole, User } from "@/types/user";

const ManageUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      try {
        console.log("Starting user fetch with filters:", { searchQuery, roleFilter, statusFilter });
        
        // First get profiles with basic user information
        let query = supabase
          .from('profiles')
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

        // Apply filters
        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }

        if (statusFilter !== "all") {
          query = query.eq("account_status", statusFilter);
        }

        if (roleFilter !== "all") {
          query = query.eq("user_roles.role", roleFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching users:", error);
          throw error;
        }

        if (!data) {
          return [];
        }

        console.log("Raw data from Supabase:", data);

        // Map the data to our User type
        const mappedUsers: User[] = data.map(user => ({
          id: user.id,
          full_name: user.full_name || 'N/A',
          email: user.email || 'N/A',
          avatar_url: user.avatar_url,
          role: user.user_roles?.[0]?.role || 'user',
          account_status: user.account_status || "inactive",
          last_login_at: user.last_login_at
        }));

        console.log("Mapped users:", mappedUsers);
        return mappedUsers;
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    retry: false
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
