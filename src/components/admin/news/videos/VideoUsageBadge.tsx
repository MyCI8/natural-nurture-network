
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/types/video";

interface VideoUsageBadgeProps {
  usage: Video["usage"];
}

export const VideoUsageBadge = ({ usage }: VideoUsageBadgeProps) => {
  let text: string;
  let variant: "default" | "secondary" | "outline" | "ghost";

  switch (usage) {
    case "latest":
      text = "Latest";
      variant = "secondary";
      break;
    case "article":
      text = "Article";
      variant = "outline";
      break;
    case "both":
      text = "Both";
      variant = "default";
      break;
    default:
      text = "None";
      variant = "ghost";
      break;
  }

  return (
    <Badge variant={variant} className="capitalize">
      {text}
    </Badge>
  );
};

export default VideoUsageBadge;
