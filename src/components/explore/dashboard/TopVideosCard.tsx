
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "@/types/video";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import { BarChart, ExternalLink, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopVideosCardProps {
  videos: Video[];
  onViewDetails: (videoId: string) => void;
}

const TopVideosCard = ({ videos, onViewDetails }: TopVideosCardProps) => {
  if (!videos.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Top Performing Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No videos found to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Top Performing Videos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <VideoThumbnail video={video} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{video.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {video.views_count || 0} views
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    {video.likes_count || 0} likes
                  </span>
                  {(video as any).product_links_count > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge
                        variant="outline"
                        className="h-5 text-xs gap-1 bg-purple-50 border-purple-200 text-purple-700"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {(video as any).product_links_count}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onViewDetails(video.id)}
                >
                  <BarChart className="h-4 w-4" />
                  <span className="sr-only">View Stats</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(`/news/videos/${video.id}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View Video</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopVideosCard;
