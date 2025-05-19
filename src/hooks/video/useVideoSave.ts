
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
    mediaFiles: File[],
    isYoutubeLink: boolean,
    isCarousel: boolean,
    getYouTubeThumbnail: (url: string) => string | null,
    asDraft = false
  ) => {
    // Only require title for video types other than "explore"
    if (formState.videoType !== "explore" && !formState.title) {
      toast.error("Please provide a title for the video");
      return false;
    }

    if (!formState.videoUrl && !mediaFile && mediaFiles.length === 0) {
      toast.error("Please provide a video URL or upload media files");
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
      let mediaFileUrls: string[] = [];

      // Handle carousel upload (multiple images)
      if (isCarousel && mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError, data } = await supabase.storage
            .from('video-media')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          return supabase.storage
            .from('video-media')
            .getPublicUrl(fileName).data.publicUrl;
        });

        mediaFileUrls = await Promise.all(uploadPromises);
        
        // Use the first image as thumbnail if not already set
        if (!thumbnailUrl && mediaFileUrls.length > 0) {
          thumbnailUrl = mediaFileUrls[0];
        }
        
        // For carousel posts, we don't use video_url
        videoUrl = null;
      }
      // Handle single video upload
      else if (mediaFile && !isYoutubeLink) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        // Extract thumbnail BEFORE uploading video
        let thumbnailFile: File | null = null;
        
        // Only extract thumbnail for videos
        if (mediaFile.type.startsWith('video/')) {
          try {
            thumbnailFile = await generateThumbnailFromVideoFile(mediaFile);
          } catch (err) {
            console.warn('Failed to extract thumbnail from uploaded video, will use placeholder:', err);
          }
        } 
        // For single image uploads, use the image itself as thumbnail
        else if (mediaFile.type.startsWith('image/')) {
          thumbnailFile = mediaFile;
        }

        // Upload video/image file
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
        
        // For image uploads, use the image URL as both video_url and thumbnail_url
        if (mediaFile.type.startsWith('image/')) {
          thumbnailUrl = videoUrl;
          mediaFileUrls = [videoUrl];
        }
      }

      // For YouTube, set thumbnail if missing
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
        show_in_latest: formState.showInLatest,
        media_files: mediaFileUrls.length > 0 ? mediaFileUrls : null,
        is_carousel: isCarousel || mediaFileUrls.length > 1
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
