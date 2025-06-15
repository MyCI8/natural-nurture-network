
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Grid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/types/video";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tables } from "@/integrations/supabase/types";

type UserRemedy = {
  id: string;
  name: string;
  summary: string;
  image_url: string;
  status: string;
  created_at: string;
};

interface AllMyContentProps {
  userId: string;
}

type MyContentItem =
  | { type: "video"; created_at: string; video: Video }
  | { type: "remedy"; created_at: string; remedy: UserRemedy };

export const AllMyContent = ({ userId }: AllMyContentProps) => {
  const navigate = useNavigate();

  // Fetch videos created by the user
  const {
    data: videos,
    isLoading: loadingVideos,
  } = useQuery({
    queryKey: ["myVideos", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", userId)
        .in("status", ["published", "archived"])
        .neq("video_type", "news")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Video[];
    },
    enabled: !!userId,
  });

  // Fetch remedies created (associated as expert) by the user
  const {
    data: remedies,
    isLoading: loadingRemedies,
  } = useQuery<UserRemedy[]>({
    queryKey: ["myRemedies", userId],
    queryFn: async () => {
      const { data: expertRemedies, error: expertError } = await supabase
        .from("expert_remedies")
        .select("remedy_id")
        .eq("expert_id", userId);

      if (expertError) throw expertError;
      if (!expertRemedies || expertRemedies.length === 0) return [];

      const remedyIds = expertRemedies.map((er: any) => er.remedy_id);

      const { data: remedies, error: remediesError } = await supabase
        .from("remedies")
        .select("id, name, summary, image_url, status, created_at")
        .in("id", remedyIds)
        .order("created_at", { ascending: false });

      if (remediesError) throw remediesError;
      return (remedies || []) as UserRemedy[];
    },
    enabled: !!userId,
  });

  const isLoading = loadingVideos || loadingRemedies;

  const items: MyContentItem[] = [
    ...(videos
      ? videos.map((video) => ({ type: "video" as const, created_at: video.created_at ?? "", video }))
      : []),
    ...(remedies
      ? remedies.map((remedy) => ({ type: "remedy" as const, created_at: remedy.created_at ?? "", remedy }))
      : []),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Grid className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground">
          Videos or remedies you create will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) =>
        item.type === "video" ? (
          <Card
            key={item.video.id}
            className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full cursor-pointer"
            onClick={() => navigate(`/videos/${item.video.id}`)}
          >
            <CardContent className="p-0 h-full">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.video.thumbnail_url || "/placeholder.svg"}
                  alt={item.video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-primary p-1 rounded-full">
                  <Grid className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-1 text-[12px] font-medium">Video</div>
                <div className="font-semibold text-xs line-clamp-2 group-hover:text-primary">
                  {item.video.title}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {item.video.description}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            key={item.remedy.id}
            className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full cursor-pointer"
            onClick={() => navigate(`/remedies/${item.remedy.id}`)}
          >
            <CardContent className="p-0 h-full">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.remedy.image_url || "/placeholder.svg"}
                  alt={item.remedy.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-green-500 p-1 rounded-full">
                  <Grid className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex items-center gap-1 text-[12px] font-medium">Remedy</div>
                <div className="font-semibold text-xs line-clamp-2 group-hover:text-primary">
                  {item.remedy.name}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {item.remedy.summary}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
};

export default AllMyContent;
