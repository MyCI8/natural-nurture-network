
import { useNavigate, useLocation } from "react-router-dom";
import { useVideoFetch } from "./video/useVideoFetch";
import { useVideoFormState } from "./video/useVideoFormState";
import { useVideoMedia } from "./video/useVideoMedia";
import { useState, useEffect } from "react";
import { useVideoSave } from "./video/useVideoSave";
import { toast } from "sonner";

export function useVideoForm(videoId?: string, defaultVideoType: "news" | "explore" | "general" = "explore") {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    video, 
    isLoading, 
    articles, 
    fetchVideo, 
    fetchArticles 
  } = useVideoFetch(videoId);
  
  const {
    formState,
    handleInputChange,
    initializeFormFromVideo
  } = useVideoFormState(videoId, defaultVideoType);
  
  const {
    mediaFile,
    mediaPreview,
    thumbnailFile,
    isYoutubeLink,
    isProcessing,
    handleMediaUpload: originalHandleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile: originalClearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    setMediaPreview,
    hasValidMedia
  } = useVideoMedia();
  
  const {
    isSaving,
    saveVideo: save
  } = useVideoSave();

  // Enhanced media upload that syncs with form state
  const handleMediaUpload = async (file: File) => {
    console.log('📤 useVideoForm handleMediaUpload called with:', file.name);
    
    try {
      const filename = await originalHandleMediaUpload(file);
      if (filename) {
        handleInputChange({ target: { name: 'video_url', value: filename } });
        console.log('📝 Form video_url updated with filename:', filename);
        toast.success("Media ready for preview", {
          description: `Your ${file.type.startsWith('video/') ? 'video' : 'image'} has been processed.`,
        });
      }
    } catch (error) {
      console.error('❌ Media upload failed in useVideoForm:', error);
      toast.error("Upload failed", {
        description: "There was an error processing your media.",
      });
      throw error; // Re-throw for UI handling
    }
  };

  // Enhanced clear that syncs with form state
  const clearMediaFile = () => {
    console.log('🗑️ useVideoForm clearMediaFile called');
    originalClearMediaFile();
    handleInputChange({ target: { name: 'video_url', value: '' } });
  };

  // Initialize form state when video is loaded
  useEffect(() => {
    if (video) {
      initializeFormFromVideo(video);
      
      if (video.video_url && (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be'))) {
        setIsYoutubeLink(true);
        setMediaPreview(getYouTubeThumbnail(video.video_url));
      }
    }
  }, [video, initializeFormFromVideo, setIsYoutubeLink, setMediaPreview, getYouTubeThumbnail]);

  const saveVideo = async (asDraft = false) => {
    console.log('💾 saveVideo called with:', {
      asDraft,
      hasValidMedia: hasValidMedia(),
      mediaFile: mediaFile?.name || 'none',
      formState: {
        title: formState.title,
        description: formState.description,
        video_url: formState.video_url,
        video_type: formState.video_type
      }
    });
    
    return save(
      videoId, 
      formState, 
      mediaFile,
      thumbnailFile,
      isYoutubeLink, 
      getYouTubeThumbnail, 
      asDraft
    );
  };

  return {
    formState,
    isLoading,
    isSaving,
    isProcessing,
    mediaPreview,
    isYoutubeLink,
    articles,
    video,
    fetchVideo,
    fetchArticles,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo,
    hasValidMedia
  };
}
