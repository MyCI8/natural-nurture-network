
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoFormState } from "./useVideoFormState";

// Types for video status
type VideoStatus = "draft" | "published" | "archived";

export function useVideoSave() {
  const [isSaving, setIsSaving] = useState(false);

  // Patch: ensure bucket exists, else create (for robust upload).
  const ensureStorageBucket = async () => {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) throw listError;
      let videoBucket = buckets?.find(bucket => bucket.name === 'video-media');

      if (!videoBucket) {
        // Only create, don't expect as full Bucket object
        const { error: createError } = await supabase.storage.createBucket('video-media', {
          public: true,
        });
        if (createError) {
          toast.error("Failed to create storage bucket. Please contact support.");
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error('❌ Bucket check/create failed:', err);
      toast.error("Storage setup failed. Contact support.");
      return false;
    }
  };

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
      mediaFileSize: mediaFile ? `${(mediaFile.size / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      isYoutubeLink,
      asDraft,
      formState: {
        title: formState.title,
        description: formState.description,
        video_type: formState.video_type
      }
    });

    // For Explore posts, title is optional and type is always 'general'
    const submitType = formState.video_type === "explore" ? "general" : formState.video_type;
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
        // PATCH: ensure (and if needed, create) bucket robustness
        const bucketExists = await ensureStorageBucket();
        if (!bucketExists) return false;

        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        // Upload logic w/ clear error
        let uploadAttempts = 0;
        let uploadData = null;
        let uploadError = null;
        while (uploadAttempts < 3 && !uploadData) {
          uploadAttempts++;
          const { error, data } = await supabase.storage
            .from('video-media')
            .upload(fileName, mediaFile, { cacheControl: '3600', upsert: false });
          if (error) {
            uploadError = error;
            if (uploadAttempts < 3) await new Promise(r => setTimeout(r, 700 * uploadAttempts));
          } else {
            uploadData = data;
            uploadError = null;
          }
        }
        if (uploadError || !uploadData) {
          toast.error("Upload failed. Please try a different file or check your connection.");
          throw new Error(uploadError?.message || "Upload failed");
        }
        videoUrl = supabase.storage.from('video-media').getPublicUrl(fileName).data.publicUrl;
        // Upload thumbnail if present
        if (thumbnailFile) {
          const thumbName = `thumbnail_${fileName.replace(/\.[^/.]+$/, "")}.jpg`;
          const { error: thumbErr } = await supabase.storage.from('video-media').upload(
            thumbName, thumbnailFile, { upsert: true }
          );
          if (!thumbErr) {
            thumbnailUrl = supabase.storage.from('video-media').getPublicUrl(thumbName).data.publicUrl;
          }
        }
      }
      // For YouTube, set thumbnail if missing
      if (isYoutubeLink && !thumbnailUrl) {
        thumbnailUrl = getYouTubeThumbnail(formState.video_url);
      }
      // For explore, use part of description for title if missing
      let title = formState.title;
      if (!title && formState.description && formState.video_type === "explore") {
        const words = formState.description.split(' ');
        title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
      }

      // PATCH: always published for post page (+type mapping)
      const statusVal: VideoStatus = asDraft ? "draft" : "published";
      // Ensure tags & location are null if missing, to satisfy types
      const videoData = {
        title: title || "Untitled Post",
        description: formState.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: statusVal,
        creator_id: user.id,
        video_type: submitType,
        related_article_id: formState.related_article_id ?? null,
        show_in_latest: formState.show_in_latest,
        location: formState.location ?? null,
        tags: formState.tags ?? null,
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
      } else {
        const { data, error } = await supabase
          .from('videos')
          .insert(videoData)
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      return result;
    } catch (error: any) {
      // More specific error messages for upload, bucket, network, size issues
      if (error.message?.includes('bucket')) {
        toast.error("Storage configuration error. Please try again.");
      } else if (error.message?.includes('network')) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (error.message?.includes('size')) {
        toast.error("File too large. Please choose a smaller file.");
      } else {
        toast.error(`Failed to save: ${error.message}`);
      }
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
