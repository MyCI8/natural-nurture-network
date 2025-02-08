
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const UserSearch = ({ searchTerm, onSearchChange }: UserSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
};
