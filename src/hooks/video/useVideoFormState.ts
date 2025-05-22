
import { useState, useEffect } from "react";
import { Video } from "@/types/video";

interface VideoFormState {
  id?: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  video_type: string;
  status: string;
  related_article_id: string | null;
  show_in_latest: boolean;
  location?: string | null;
  tags?: string[] | null;
}

export function useVideoFormState(videoId?: string, defaultVideoType: "news" | "explore" | "general" = "explore") {
  const initialState: VideoFormState = {
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: null,
    video_type: defaultVideoType === "explore" ? "general" : defaultVideoType, // "general" is mapped to "explore" in UI
    status: "draft",
    related_article_id: null,
    show_in_latest: false,
    location: null,
    tags: null,
  };

  const [formState, setFormState] = useState<VideoFormState>(initialState);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle checkbox inputs
    if (e.target.type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormState(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
      return;
    }
    
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initialize form from video data
  const initializeFormFromVideo = (video: Video) => {
    setFormState({
      id: video.id,
      title: video.title || "",
      description: video.description || "",
      video_url: video.video_url || "",
      thumbnail_url: video.thumbnail_url,
      video_type: video.video_type || initialState.video_type,
      status: video.status || "draft",
      related_article_id: video.related_article_id,
      show_in_latest: video.show_in_latest || false,
      location: video.location || null,
      tags: video.tags || null,
    });
  };

  return {
    formState,
    setFormState,
    handleInputChange,
    initializeFormFromVideo
  };
}
