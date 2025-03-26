
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";

interface UserFormData {
  email: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  role?: UserRole;
  account_status: "active" | "inactive";
}

interface UserFormProps {
  userId?: string;
  initialData?: UserFormData | null;
}

export const UserForm = ({ userId, initialData }: UserFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || "");
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UserFormData>({
    defaultValues: initialData || {
      account_status: "active",
    },
  });

  // Set avatar URL in form when it changes
  useEffect(() => {
    setValue("avatar_url", avatarUrl);
  }, [avatarUrl, setValue]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      try {
        if (userId) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              full_name: data.full_name,
              username: data.username,
              avatar_url: data.avatar_url,
              account_status: data.account_status,
            })
            .eq("id", userId);

          if (profileError) throw profileError;

          if (data.role) {
            const { error: roleError } = await supabase
              .from("user_roles")
              .upsert({
                user_id: userId,
                role: data.role,
              }, {
                onConflict: "user_id",
              });

            if (roleError) throw roleError;
          }
        } else {
          const { error: signUpError, data: authData } = await supabase.auth.signUp({
            email: data.email,
            password: crypto.randomUUID(),
          });

          if (signUpError) throw signUpError;

          const newUserId = authData.user?.id;
          if (!newUserId) throw new Error("Failed to create user");

          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              full_name: data.full_name,
              username: data.username,
              avatar_url: data.avatar_url,
              account_status: data.account_status,
            })
            .eq("id", newUserId);

          if (profileError) throw profileError;

          if (data.role) {
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: newUserId,
                role: data.role,
              });

            if (roleError) throw roleError;
          }
        }
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `User ${userId ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/admin/users");
    },
    onError: (error) => {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    console.log("Submitting form with data:", data);
    updateUserMutation.mutate(data);
  };

  const handleAvatarUpdate = (url: string) => {
    console.log("Avatar URL updated:", url);
    setAvatarUrl(url);
    setValue("avatar_url", url);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          {userId && (
            <ProfileImageUpload
              userId={userId}
              avatarUrl={avatarUrl}
              fullName={initialData?.full_name}
              onImageUpdate={handleAvatarUpdate}
            />
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: !userId })}
                disabled={!!userId}
              />
            </div>

            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                {...register("full_name", { required: true })}
              />
            </div>

            <div>
              <Label htmlFor="username">Username (optional)</Label>
              <Input
                id="username"
                {...register("username")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value: UserRole) => register("role").onChange({ target: { value } })}
                defaultValue={initialData?.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account_status">Account Status</Label>
              <Select
                onValueChange={(value: "active" | "inactive") => register("account_status").onChange({ target: { value } })}
                defaultValue={initialData?.account_status || "active"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/users")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateUserMutation.isPending || isUploading}>
          {updateUserMutation.isPending || isUploading ? 
            "Saving..." : 
            (userId ? "Update User" : "Create User")
          }
        </Button>
      </div>
    </form>
  );
};
