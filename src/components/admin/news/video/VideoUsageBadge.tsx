
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoUsageBadgeProps {
  usage: "latest" | "article" | "both" | "none";
  articleTitle?: string;
  showInLatest?: boolean;
}

export const VideoUsageBadge = ({ usage, articleTitle, showInLatest }: VideoUsageBadgeProps) => {
  // Determine badge variant and text based on usage
  let badgeVariant: "outline" | "secondary" | "default" = "outline";
  let badgeText = "Not Used";
  let tooltipText = "This video is not being used";

  if (usage === "both") {
    badgeVariant = "default";
    badgeText = "Both";
    tooltipText = `Used in Latest Videos and article: "${articleTitle}"`;
  } else if (usage === "article") {
    badgeVariant = "secondary";
    badgeText = "In Article";
    tooltipText = `Used in article: "${articleTitle}"`;
  } else if (usage === "latest") {
    badgeVariant = "outline";
    badgeText = "Latest Videos";
    tooltipText = "Shown in Latest Videos section";
  }

  // If showInLatest is explicitly false, override badge for videos marked "latest" or "both"
  if (showInLatest === false && (usage === "latest" || usage === "both")) {
    badgeVariant = "outline";
    badgeText = "Hidden";
    tooltipText = "Marked as hidden from Latest Videos section";
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={badgeVariant} className="whitespace-nowrap">
          {badgeText}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
