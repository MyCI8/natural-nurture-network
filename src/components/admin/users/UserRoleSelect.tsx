
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/user";

interface UserRoleSelectProps {
  role: UserRole;
  onRoleChange: (value: UserRole) => void;
}

export const UserRoleSelect = ({ role, onRoleChange }: UserRoleSelectProps) => {
  return (
    <Select defaultValue={role} onValueChange={onRoleChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="super_admin">Super Admin</SelectItem>
      </SelectContent>
    </Select>
  );
};
