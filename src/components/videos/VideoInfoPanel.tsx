
import { formatDistance } from "date-fns";
import { File, Eye, Heart, MessageSquare, MapPin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@/types/video";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoInfoPanelProps {
  video: Video | null;
  isLoading: boolean;
}

export const VideoInfoPanel = ({ video, isLoading }: VideoInfoPanelProps) => {
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!video) return null;

  // Calculate approximate file size (this is just an estimate)
  const fileSize = video.video_url?.includes('youtube.com') ? 
    'YouTube Video' : 
    'Unknown Size';  // In a real app, we would track file size during upload

  // Format date
  const uploadDate = formatDistance(
    new Date(video.created_at),
    new Date(),
    { addSuffix: true }
  );

  const metrics = [
    {
      icon: <User className="h-5 w-5 text-muted-foreground" />,
      label: "Creator",
      value: video.creator?.full_name || video.creator?.username || "Unknown",
    },
    {
      icon: <File className="h-5 w-5 text-muted-foreground" />,
      label: "File",
      value: fileSize,
    },
    {
      icon: <Eye className="h-5 w-5 text-muted-foreground" />,
      label: "Views",
      value: video.views_count.toString(),
    },
    {
      icon: <Heart className="h-5 w-5 text-muted-foreground" />,
      label: "Likes",
      value: video.likes_count.toString(),
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
      label: "Comments",
      value: "0", // This would need to be fetched separately
    },
    {
      icon: <MapPin className="h-5 w-5 text-muted-foreground" />,
      label: "Upload Location",
      value: "Unknown", // This would need IP geolocation data
    },
  ];

  return (
    <Card className="mb-4 border-muted/60">
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/40 transition-colors touch-manipulation">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                {metric.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          <p>Uploaded {uploadDate}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoInfoPanel;
