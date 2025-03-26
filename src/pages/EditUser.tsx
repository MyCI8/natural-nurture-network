
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserForm } from "@/components/admin/users/UserForm";

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNewUser = id === "new";

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (isNewUser) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles:user_roles (
            role
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      console.log("Fetched user profile:", profile);

      return {
        ...profile,
        role: profile.user_roles?.[0]?.role,
        account_status: profile.account_status as "active" | "inactive"
      };
    },
    enabled: !isNewUser,
  });

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

        <h1 className="text-3xl font-bold mb-8">
          {isNewUser ? "Add New User" : "Edit User"}
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading user data...</p>
          </div>
        ) : (
          <UserForm userId={isNewUser ? undefined : id} initialData={user} />
        )}
      </div>
    </div>
  );
};

export default EditUser;
