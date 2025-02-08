
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserStatusSelectProps {
  status: string;
  onStatusChange: (value: string) => void;
}

export const UserStatusSelect = ({ status, onStatusChange }: UserStatusSelectProps) => {
  return (
    <Select defaultValue={status} onValueChange={onStatusChange}>
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
  );
};
