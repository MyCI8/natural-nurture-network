
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { NewspaperIcon, PlayCircle } from "lucide-react";

interface VideoUsageBadgeProps {
  usage: "latest" | "article" | "both" | "none";
  articleTitle?: string;
  showInLatest?: boolean;
}

export const VideoUsageBadge = ({ usage, articleTitle, showInLatest }: VideoUsageBadgeProps) => {
  return (
    <TooltipProvider>
      {usage === "both" ? (
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
                <PlayCircle className="h-3 w-3" />
                Latest
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Displayed in latest videos section</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
                <NewspaperIcon className="h-3 w-3" />
                Article
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Linked in article: {articleTitle}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : usage === "latest" ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 gap-1">
              <PlayCircle className="h-3 w-3" />
              Latest
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Displayed in latest videos section</p>
          </TooltipContent>
        </Tooltip>
      ) : usage === "article" ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 gap-1">
              <NewspaperIcon className="h-3 w-3" />
              Article
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Linked in article: {articleTitle}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-muted-foreground text-sm">None</span>
      )}
    </TooltipProvider>
  );
};
