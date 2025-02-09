
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RemedyStatusSectionProps {
  status: "draft" | "published";
  onStatusChange: (status: "draft" | "published") => void;
}

export const RemedyStatusSection = ({
  status,
  onStatusChange,
}: RemedyStatusSectionProps) => {
  return (
    <div>
      <Label>Status</Label>
      <Select
        value={status}
        onValueChange={(value: "draft" | "published") => onStatusChange(value)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
