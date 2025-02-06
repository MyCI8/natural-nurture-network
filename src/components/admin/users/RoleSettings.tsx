
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RolePermissions = {
  can_manage_roles?: boolean;
  can_manage_users?: boolean;
  can_manage_content?: boolean;
  can_manage_settings?: boolean;
};

interface RoleSetting {
  id: string;
  role: "user" | "admin" | "super_admin";
  permissions: RolePermissions;
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
      permissions: RolePermissions;
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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Manage Roles</TableHead>
          <TableHead>Manage Users</TableHead>
          <TableHead>Manage Content</TableHead>
          <TableHead>Manage Settings</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {settings.map((setting) => (
          <TableRow key={setting.id}>
            <TableCell className="font-medium capitalize">
              {setting.role.replace("_", " ")}
            </TableCell>
            <TableCell>
              <Switch
                checked={setting.permissions.can_manage_roles || false}
                onCheckedChange={(checked) => {
                  updatePermissionMutation.mutate({
                    roleId: setting.id,
                    permissions: {
                      ...setting.permissions,
                      can_manage_roles: checked,
                    },
                  });
                }}
                disabled={setting.role === "super_admin"}
              />
            </TableCell>
            <TableCell>
              <Switch
                checked={setting.permissions.can_manage_users || false}
                onCheckedChange={(checked) => {
                  updatePermissionMutation.mutate({
                    roleId: setting.id,
                    permissions: {
                      ...setting.permissions,
                      can_manage_users: checked,
                    },
                  });
                }}
                disabled={setting.role === "super_admin"}
              />
            </TableCell>
            <TableCell>
              <Switch
                checked={setting.permissions.can_manage_content || false}
                onCheckedChange={(checked) => {
                  updatePermissionMutation.mutate({
                    roleId: setting.id,
                    permissions: {
                      ...setting.permissions,
                      can_manage_content: checked,
                    },
                  });
                }}
                disabled={setting.role === "super_admin"}
              />
            </TableCell>
            <TableCell>
              <Switch
                checked={setting.permissions.can_manage_settings || false}
                onCheckedChange={(checked) => {
                  updatePermissionMutation.mutate({
                    roleId: setting.id,
                    permissions: {
                      ...setting.permissions,
                      can_manage_settings: checked,
                    },
                  });
                }}
                disabled={setting.role === "super_admin"}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
