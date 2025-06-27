
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
    thumbnailFile,
    isYoutubeLink,
    mediaUrl,
    isProcessing,
    error: mediaError,
    handleMediaUpload: originalHandleMediaUpload,
    handleVideoLinkChange: originalHandleVideoLinkChange,
    clearMediaFile: originalClearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    hasValidMedia: originalHasValidMedia,
    getCurrentMediaType
  } = useVideoMedia();
  
  const {
    isSaving,
    saveVideo: save
  } = useVideoSave();

  // Enhanced media upload that syncs with form state
  const handleMediaUpload = async (file: File) => {
    console.log('handleMediaUpload called with:', file.name);
    
    try {
      const mediaData = await originalHandleMediaUpload(file);
      if (mediaData && mediaData.previewUrl) {
        console.log('Setting video_url to:', mediaData.previewUrl);
        handleInputChange({ target: { name: 'video_url', value: mediaData.previewUrl } });
        
        // Show success toast immediately after successful processing
        toast.success("Media ready for preview", {
          description: `Your ${mediaData.mediaType} has been processed successfully.`,
        });
      }
    } catch (error) {
      console.error('Media upload failed:', error);
      toast.error("Upload failed", {
        description: "There was an error processing your media.",
      });
    }
  };

  // Enhanced video link change that syncs with form state
  const handleVideoLinkChange = (url: string) => {
    console.log('handleVideoLinkChange called with:', url);
    originalHandleVideoLinkChange(url);
    handleInputChange({ target: { name: 'video_url', value: url } });
    
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      const thumbnailUrl = getYouTubeThumbnail(url);
      if (thumbnailUrl) {
        handleInputChange({ target: { name: 'thumbnail_url', value: thumbnailUrl } });
      }
    }
  };

  // Enhanced clear that syncs with form state
  const clearMediaFile = () => {
    console.log('clearMediaFile called');
    originalClearMediaFile();
    handleInputChange({ target: { name: 'video_url', value: '' } });
    handleInputChange({ target: { name: 'thumbnail_url', value: '' } });
  };

  // Initialize form state when video is loaded
  useEffect(() => {
    if (video) {
      initializeFormFromVideo(video);
      
      if (video.video_url && (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be'))) {
        setIsYoutubeLink(true);
      }
    }
  }, [video, initializeFormFromVideo, setIsYoutubeLink]);

  const saveVideo = async (asDraft = false) => {
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

  // Simplified media validation - use the hook's validation directly
  const hasValidMedia = () => {
    const hookHasMedia = originalHasValidMedia();
    const formHasUrl = Boolean(formState.video_url && formState.video_url.length > 0);
    
    const result = hookHasMedia || formHasUrl;
    
    console.log('useVideoForm hasValidMedia check:', {
      hookHasMedia,
      formHasUrl,
      result,
      formStateVideoUrl: formState.video_url,
      isProcessing
    });
    
    return result;
  };

  return {
    formState,
    isLoading,
    isSaving,
    isProcessing,
    isYoutubeLink,
    articles,
    video,
    error: mediaError,
    fetchVideo,
    fetchArticles,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo,
    hasValidMedia,
    getCurrentMediaType
  };
}
