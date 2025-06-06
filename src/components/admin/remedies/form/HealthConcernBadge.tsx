
import React from "react";
import { Badge } from "@/components/ui/badge";
import { X, Clock } from "lucide-react";

interface HealthConcernBadgeProps {
  concern: string;
  index: number;
  isPending: boolean;
  onRemove: (concern: string) => void;
}

export const HealthConcernBadge = ({ 
  concern, 
  index, 
  isPending, 
  onRemove 
}: HealthConcernBadgeProps) => {
  return (
    <Badge
      key={index}
      variant={isPending ? "outline" : "secondary"}
      className={`flex items-center gap-1 ${isPending ? 'border-dashed border-blue-300 text-blue-600 bg-blue-50' : ''}`}
    >
      {concern}
      {isPending && (
        <Clock className="h-3 w-3" />
      )}
      <X
        className="h-3 w-3 cursor-pointer hover:text-destructive"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(concern);
        }}
      />
    </Badge>
  );
};
