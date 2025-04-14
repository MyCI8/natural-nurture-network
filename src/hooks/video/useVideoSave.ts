
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoFormState } from "./useVideoFormState";

export function useVideoSave() {
  const [isSaving, setIsSaving] = useState(false);

  const saveVideo = async (
    videoId: string | undefined,
    formState: VideoFormState,
    mediaFile: File | null,
    isYoutubeLink: boolean,
    getYouTubeThumbnail: (url: string) => string | null,
    asDraft = false
  ) => {
    if (!formState.title) {
      toast.error("Please provide a title for the video");
      return false;
    }

    if (!formState.videoUrl && !mediaFile) {
      toast.error("Please provide a video URL or upload a file");
      return false;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to save videos");
        return false;
      }

      let videoUrl = formState.videoUrl;
      let thumbnailUrl = formState.thumbnailUrl;
      
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('video-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        videoUrl = supabase.storage
          .from('video-media')
          .getPublicUrl(fileName).data.publicUrl;
      }

      if (isYoutubeLink && !thumbnailUrl) {
        thumbnailUrl = getYouTubeThumbnail(formState.videoUrl);
      }

      const mappedVideoType = formState.videoType === "explore" ? "general" : formState.videoType;

      const videoData = {
        title: formState.title,
        description: formState.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: (asDraft ? "draft" : "published") as "draft" | "published" | "archived",
        creator_id: user.id,
        video_type: mappedVideoType,
        related_article_id: formState.relatedArticleId,
        show_in_latest: formState.showInLatest
      };

      let result;
      
      if (videoId) {
        const { data, error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', videoId)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast.success(asDraft ? "Draft saved successfully" : "Video updated successfully");
      } else {
        const { data, error } = await supabase
          .from('videos')
          .insert(videoData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        
        toast.success(asDraft ? "Draft saved successfully" : "Video published successfully");
      }

      return result;
    } catch (error: any) {
      console.error("Error saving video:", error);
      toast.error(`Failed to save: ${error.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveVideo
  };
}
