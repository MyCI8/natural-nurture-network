
import { useState } from "react";
import { Video } from "@/types/video";

export type VideoFormState = {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  showInLatest: boolean;
  status: "draft" | "published" | "archived";
  relatedArticleId: string | null;
  videoType: "news" | "explore" | "general";
};

export function useVideoFormState(videoId?: string, defaultVideoType: "news" | "explore" | "general" = "explore") {
  const [formState, setFormState] = useState<VideoFormState>({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: null,
    showInLatest: true,
    status: "draft",
    relatedArticleId: null,
    videoType: defaultVideoType
  });
  
  const handleInputChange = (name: keyof VideoFormState, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const initializeFormFromVideo = (data: Video) => {
    let mappedVideoType = data.video_type;
    if (mappedVideoType === "general") {
      mappedVideoType = "explore";
    }
    
    setFormState({
      title: data.title || "",
      description: data.description || "",
      videoUrl: data.video_url || "",
      thumbnailUrl: data.thumbnail_url,
      showInLatest: data.show_in_latest ?? true,
      status: data.status as "draft" | "published" | "archived",
      relatedArticleId: data.related_article_id || null,
      videoType: mappedVideoType as "news" | "explore" | "general"
    });
  };
  
  return {
    formState,
    handleInputChange,
    setFormState,
    initializeFormFromVideo
  };
}
