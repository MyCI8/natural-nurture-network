
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
    thumbnailFile: File | null,
    isYoutubeLink: boolean,
    getYouTubeThumbnail: (url: string) => string | null,
    asDraft = false
  ) => {
    console.log('🎯 useVideoSave called with:', {
      videoId,
      hasMediaFile: !!mediaFile,
      mediaFileName: mediaFile?.name,
      isYoutubeLink,
      asDraft,
      formState: {
        title: formState.title,
        description: formState.description,
        video_type: formState.video_type
      }
    });

    // For Explore posts, title is optional
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
        console.log('📤 Starting file upload for:', mediaFile.name);
        
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        // Upload video file to storage
        console.log('🗂️ Uploading to storage bucket: video-media');
        const { error: uploadError, data } = await supabase.storage
          .from('video-media')
          .upload(fileName, mediaFile);

        if (uploadError) {
          console.error('❌ Storage upload failed:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log('✅ File uploaded successfully:', data);

        videoUrl = supabase.storage
          .from('video-media')
          .getPublicUrl(fileName).data.publicUrl;

        console.log('🔗 Generated public URL:', videoUrl);

        // Upload thumbnail if we have it
        if (thumbnailFile) {
          console.log('🖼️ Uploading thumbnail...');
          const thumbName = `thumbnail_${fileName.replace(/\.[^/.]+$/, "")}.jpg`;
          const { error: thumbErr } = await supabase.storage
            .from('video-media')
            .upload(thumbName, thumbnailFile, { upsert: true });
          if (!thumbErr) {
            thumbnailUrl = supabase.storage
              .from('video-media')
              .getPublicUrl(thumbName).data.publicUrl;
            console.log('✅ Thumbnail uploaded:', thumbnailUrl);
          } else {
            console.warn('⚠️ Thumbnail upload failed:', thumbErr);
          }
        }
      }

      // For YouTube, set thumbnail if missing
      if (isYoutubeLink && !thumbnailUrl) {
        thumbnailUrl = getYouTubeThumbnail(formState.video_url);
      }

      const mappedVideoType = formState.video_type === "explore" ? "general" : formState.video_type;

      // For explore posts, use description as title if title is empty
      let title = formState.title;
      if (!title && formState.description && formState.video_type === "explore") {
        // Use first few words of description as title if missing
        const words = formState.description.split(' ');
        title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
      }

      const videoData = {
        title: title || "Untitled Post",
        description: formState.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: (asDraft ? "draft" : "published") as "draft" | "published" | "archived",
        creator_id: user.id,
        video_type: mappedVideoType,
        related_article_id: formState.related_article_id,
        show_in_latest: formState.show_in_latest,
        location: formState.location,
        tags: formState.tags
      };

      console.log('💾 Saving video data to database:', videoData);

      let result;

      if (videoId) {
        const { data, error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', videoId)
          .select()
          .single();

        if (error) {
          console.error('❌ Database update failed:', error);
          throw error;
        }
        result = data;
        console.log('✅ Video updated successfully:', result);
      } else {
        const { data, error } = await supabase
          .from('videos')
          .insert(videoData)
          .select()
          .single();

        if (error) {
          console.error('❌ Database insert failed:', error);
          throw error;
        }
        result = data;
        console.log('✅ Video created successfully:', result);
      }

      return result;
    } catch (error: any) {
      console.error("❌ Error saving video:", error);
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
