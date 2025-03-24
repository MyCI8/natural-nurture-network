
import { Badge } from "@/components/ui/badge";

interface VideoStatusBadgeProps {
  status: "draft" | "published" | "archived";
  className?: string;
}

export function VideoStatusBadge({ status, className }: VideoStatusBadgeProps) {
  switch (status) {
    case "published":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Published
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Draft
        </Badge>
      );
    case "archived":
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
          Archived
        </Badge>
      );
    default:
      return null;
  }
}
