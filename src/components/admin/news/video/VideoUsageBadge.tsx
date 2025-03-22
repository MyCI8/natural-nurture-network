
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FC } from "react";

interface VideoUsageBadgeProps {
  usage: "latest" | "article" | "both" | "none";
  articleTitle?: string;
}

export const VideoUsageBadge: FC<VideoUsageBadgeProps> = ({ usage, articleTitle }) => {
  if (usage === "both") {
    return (
      <div className="flex gap-1">
        <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200 font-bold">
          LV
        </Badge>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200 font-bold cursor-help">
              AR
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-2">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Related Article</h4>
              <p className="text-sm">{articleTitle || "Unknown article"}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }

  if (usage === "latest") {
    return (
      <Badge className="bg-green-100 hover:bg-green-100 text-green-800 border-green-200 font-bold">
        LV
      </Badge>
    );
  }

  if (usage === "article") {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200 font-bold cursor-help">
            AR
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-2">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Related Article</h4>
            <p className="text-sm">{articleTitle || "Unknown article"}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Badge variant="outline" className="opacity-50">
      None
    </Badge>
  );
};
