
import { formatDistance } from "date-fns";
import { File, Eye, Heart, MessageSquare, MapPin, User, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Video } from "@/types/video";
import { Skeleton } from "@/components/ui/skeleton";
import VideoThumbnail from "@/components/video/VideoThumbnail";

interface VideoInfoPanelProps {
  video: Video | null;
  isLoading: boolean;
}

export const VideoInfoPanel = ({ video, isLoading }: VideoInfoPanelProps) => {
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-2 sm:p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
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
    'Uploaded Video';  // In a real app, we would track file size during upload

  // Format date
  const uploadDate = formatDistance(
    new Date(video.created_at),
    new Date(),
    { addSuffix: true }
  );

  const metrics = [
    {
      icon: <User className="h-4 w-4 text-muted-foreground" />,
      label: "Creator",
      value: video.creator?.full_name || video.creator?.username || "Unknown",
    },
    {
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      label: "Uploaded",
      value: uploadDate,
    },
    {
      icon: <File className="h-4 w-4 text-muted-foreground" />,
      label: "File",
      value: fileSize,
    },
    {
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
      label: "Views",
      value: video.views_count.toString(),
    },
    {
      icon: <Heart className="h-4 w-4 text-muted-foreground" />,
      label: "Likes",
      value: video.likes_count.toString(),
    },
    {
      icon: <MessageSquare className="h-4 w-4 text-muted-foreground" />,
      label: "Comments",
      value: "0", // This would need to be fetched separately
    },
  ];

  return (
    <Card className="mb-4 border-muted/60">
      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <VideoThumbnail 
              video={video} 
              width="w-full" 
              height="h-auto"
              className="rounded-md overflow-hidden"
            />
          </div>
          
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent/40 transition-colors touch-manipulation">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/70">
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoInfoPanel;
