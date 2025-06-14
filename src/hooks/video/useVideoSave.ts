import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VideoFormState } from "./useVideoFormState";

// Types for video status
type VideoStatus = "draft" | "published" | "archived";

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
      mediaFileSize: mediaFile ? `${(mediaFile.size / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      isYoutubeLink,
      asDraft,
      formState: {
        title: formState.title,
        description: formState.description,
        video_type: formState.video_type,
        video_url: formState.video_url
      }
    });

    // For Explore posts, type is 'general'
    const submitType = formState.video_type === "explore" ? "general" : formState.video_type;
    
    // Title validation removed as it's auto-generated if missing.

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

      // Only handle file upload if we have a file and no existing URL
      if (mediaFile && !isYoutubeLink && !videoUrl?.startsWith('http')) {
        console.log('📤 Starting file upload to Supabase storage bucket: video-media');
        console.log('File details:', { name: mediaFile.name, size: mediaFile.size, type: mediaFile.type });
        
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        console.log('Generated file path in bucket:', fileName);

        const { error, data } = await supabase.storage
          .from('video-media')
          .upload(fileName, mediaFile, { 
            cacheControl: '3600', 
            upsert: false 
          });

        if (error) {
          console.error("Supabase Storage Upload Error:", error);
          if (error.message.includes("The resource was not found")) {
            toast.error("Upload Failed: Storage bucket 'video-media' not found.", {
              description: "Please check your Supabase project settings. The 'video-media' bucket might be missing or misconfigured.",
              duration: 10000
            });
          } else {
            toast.error(`Upload failed: ${error.message}`);
          }
          return false;
        }

        videoUrl = supabase.storage.from('video-media').getPublicUrl(fileName).data.publicUrl;
        console.log('✅ File uploaded successfully:', videoUrl);
        
        // Upload thumbnail if present
        if (thumbnailFile) {
          const thumbName = `${user.id}/thumbnail_${crypto.randomUUID()}.jpg`;
          const { error: thumbErr } = await supabase.storage
            .from('video-media')
            .upload(thumbName, thumbnailFile, { upsert: true });
          
          if (!thumbErr) {
            thumbnailUrl = supabase.storage.from('video-media').getPublicUrl(thumbName).data.publicUrl;
          }
        }
      }

      // For YouTube, set thumbnail if missing
      if (isYoutubeLink && !thumbnailUrl) {
        thumbnailUrl = getYouTubeThumbnail(formState.video_url);
      }

      // If title is missing, generate it from the description
      let title = formState.title;
      if (!title && formState.description) {
        const words = formState.description.split(' ');
        title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
      }

      // Status mapping
      const statusVal: VideoStatus = asDraft ? "draft" : "published";
      
      // Prepare video data
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

      console.log('💾 Saving video data to database:', videoData);

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
      
      console.log('✅ Video saved successfully:', result);
      return result;
    } catch (error: any) {
      console.error("Save error:", error);
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
