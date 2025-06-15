import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import VideoModal from "@/components/video/VideoModal";
import { Video } from "@/types/video";

const LatestVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: videos, isLoading } = useQuery<(Video & { profiles: any })[]>({
    queryKey: ["latest-news-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("status", "published")
        .eq("video_type", "news")
        .eq("show_in_latest", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 bg-muted/30 rounded-lg">
              <div className="space-y-3">
                <Skeleton className="w-full aspect-[16/9] rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Latest Videos</h2>
      </div>

      <div className="space-y-3">
        {videos?.map((video) => (
          <div
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="cursor-pointer"
          >
            <Card className="group hover:shadow-md transition-all duration-300 border-0 bg-muted/30 hover:bg-muted/50">
              <CardContent className="p-3">
                <div className="relative w-full rounded-lg overflow-hidden bg-muted mb-3">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={video.thumbnail_url || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
};

export default LatestVideos;
