
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Permission = {
  can_manage_roles?: boolean;
  can_manage_users?: boolean;
  can_manage_content?: boolean;
  can_manage_settings?: boolean;
  can_comment?: boolean;
  can_view_content?: boolean;
};

interface RoleSetting {
  id: string;
  role: "user" | "admin" | "super_admin";
  permissions: Permission;
  created_at: string;
  updated_at: string;
}

interface RoleSettingsProps {
  settings: RoleSetting[];
  isLoading: boolean;
}

export const RoleSettings = ({ settings, isLoading }: RoleSettingsProps) => {
  const queryClient = useQueryClient();

  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: Permission;
    }) => {
      const { error } = await supabase
        .from("role_settings")
        .update({ permissions })
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleSettings"] });
      toast.success("Permissions updated successfully");
    },
    onError: (error) => {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        ))}
      </div>
    );
  }

  const permissionLabels = {
    can_manage_roles: "Manage Roles",
    can_manage_users: "Manage Users",
    can_manage_content: "Manage Content",
    can_manage_settings: "Manage Settings",
    can_comment: "Comment",
    can_view_content: "View Content"
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          {Object.entries(permissionLabels).map(([key]) => (
            <TableHead key={key}>{permissionLabels[key as keyof typeof permissionLabels]}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {settings.map((setting) => (
          <TableRow key={setting.id}>
            <TableCell className="font-medium capitalize">
              {setting.role.replace("_", " ")}
            </TableCell>
            {Object.entries(permissionLabels).map(([key]) => (
              <TableCell key={key}>
                <Switch
                  checked={setting.permissions[key as keyof Permission] || false}
                  onCheckedChange={(checked) => {
                    updatePermissionMutation.mutate({
                      roleId: setting.id,
                      permissions: {
                        ...setting.permissions,
                        [key]: checked,
                      },
                    });
                  }}
                  disabled={setting.role === "super_admin"}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
