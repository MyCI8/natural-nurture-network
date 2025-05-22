
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoFormState } from "./useVideoFormState";
import { generateThumbnailFromVideoFile } from "./useVideoMedia";

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
    // Only require title for video types other than "explore"
    if (formState.video_type !== "explore" && !formState.title) {
      toast.error("Please provide a title for the video");
      return false;
    }

    if (!formState.video_url && !mediaFile) {
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

      let videoUrl = formState.video_url;
      let thumbnailUrl = formState.thumbnail_url;

      // Only for uploaded videos (not YouTube)
      if (mediaFile && !isYoutubeLink) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        // Extract thumbnail BEFORE uploading video
        let thumbnailFile: File | null = null;
        try {
          thumbnailFile = await generateThumbnailFromVideoFile(mediaFile);
        } catch (err) {
          console.warn('Failed to extract thumbnail from uploaded video, will use placeholder:', err);
        }

        // Upload video file
        const { error: uploadError, data } = await supabase.storage
          .from('video-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        videoUrl = supabase.storage
          .from('video-media')
          .getPublicUrl(fileName).data.publicUrl;

        // Upload thumbnail if we have it
        if (thumbnailFile) {
          // Use same name as video, prefixed
          const thumbName = `thumbnail_${fileName.replace(/\.[^/.]+$/, "")}.jpg`;
          const { error: thumbErr } = await supabase.storage
            .from('video-media')
            .upload(thumbName, thumbnailFile, { upsert: true });
          if (!thumbErr) {
            thumbnailUrl = supabase.storage
              .from('video-media')
              .getPublicUrl(thumbName).data.publicUrl;
          } else {
            console.warn('Uploading extracted thumbnail failed:', thumbErr);
          }
        }
        // If thumbnail extraction/upload failed, thumbnailUrl stays null (handled by UI fallback logic)
      }

      // For YouTube, set thumbnail if missing
      if (isYoutubeLink && !thumbnailUrl) {
        thumbnailUrl = getYouTubeThumbnail(formState.video_url);
      }

      const mappedVideoType = formState.video_type === "explore" ? "general" : formState.video_type;

      const videoData = {
        title: formState.title,
        description: formState.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: (asDraft ? "draft" : "published") as "draft" | "published" | "archived",
        creator_id: user.id,
        video_type: mappedVideoType,
        related_article_id: formState.related_article_id,
        show_in_latest: formState.show_in_latest
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

        toast("Draft saved successfully");
      } else {
        const { data, error } = await supabase
          .from('videos')
          .insert(videoData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        toast("Draft saved successfully");
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
