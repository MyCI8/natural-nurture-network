
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Grid, Play, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/types/video";
import { Skeleton } from "@/components/ui/skeleton";
import { isYoutubeVideo, isImagePost } from "@/utils/videoUtils";

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

      if (error) {throw error;}
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

      if (expertError) {throw expertError;}
      if (!expertRemedies || expertRemedies.length === 0) {return [];}

      const remedyIds = expertRemedies.map((er: any) => er.remedy_id);

      const { data: remedies, error: remediesError } = await supabase
        .from("remedies")
        .select("id, name, summary, image_url, status, created_at")
        .in("id", remedyIds)
        .order("created_at", { ascending: false });

      if (remediesError) {throw remediesError;}
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

  // Helper function to get the correct thumbnail URL
  const getThumbnailUrl = (item: MyContentItem) => {
    if (item.type === "remedy") {
      return item.remedy.image_url || "/placeholder.svg";
    }

    const video = item.video;
    
    // For image posts, use video_url as the image source
    if (isImagePost(video.video_url || '')) {
      return video.video_url || "/placeholder.svg";
    }
    
    // For YouTube videos, generate thumbnail
    if (isYoutubeVideo(video.video_url || '')) {
      const getYouTubeThumbnail = (url: string): string => {
        try {
          let videoId = "";
          if (url.includes("youtube.com/watch")) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get("v") || "";
          } else if (url.includes("youtu.be/")) {
            videoId = url.split("youtu.be/")[1].split("?")[0];
          }
          
          if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        } catch (error) {
          console.error("Error parsing YouTube URL:", error);
        }
        return "/placeholder.svg";
      };
      
      return getYouTubeThumbnail(video.video_url || '');
    }
    
    // For regular videos, use thumbnail_url if available, otherwise fallback
    return video.thumbnail_url || "/placeholder.svg";
  };

  // Helper function to get media type icon
  const getMediaTypeIcon = (item: MyContentItem) => {
    if (item.type === "remedy") {
      return null; // No icon for remedies
    }

    const video = item.video;
    
    if (isImagePost(video.video_url || '')) {
      return <ImageIcon className="h-4 w-4 text-white" />;
    }
    
    if (isYoutubeVideo(video.video_url || '') || video.video_url?.includes('.mp4')) {
      return <Play className="h-4 w-4 text-white" />;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-sm" />
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
    <div className="grid grid-cols-3 gap-1">
      {items.map((item) => (
        <div
          key={item.type === "video" ? item.video.id : item.remedy.id}
          className="relative aspect-square cursor-pointer group"
          onClick={() => {
            if (item.type === "video") {
              navigate(`/videos/${item.video.id}`);
            } else {
              navigate(`/remedies/${item.remedy.id}`);
            }
          }}
        >
          <img
            src={getThumbnailUrl(item)}
            alt={item.type === "video" ? item.video.title : item.remedy.name}
            className="w-full h-full object-cover rounded-sm"
          />
          
          {/* Media type indicator - only show on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-sm flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {getMediaTypeIcon(item)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllMyContent;
