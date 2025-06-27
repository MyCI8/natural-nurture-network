
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

  // Simplified media upload - no complex state sync
  const handleMediaUpload = async (file: File) => {
    console.log('🎯 useVideoForm handleMediaUpload called with:', file.name);
    
    try {
      const mediaData = await originalHandleMediaUpload(file);
      if (mediaData && mediaData.previewUrl) {
        console.log('✅ Media processed successfully:', mediaData.previewUrl);
        
        // Simple form state update
        handleInputChange({ target: { name: 'video_url', value: mediaData.previewUrl } });
        
        toast.success("Media uploaded successfully!");
      }
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      toast.error("Upload failed. Please try again.");
    }
  };

  // Simplified video link change
  const handleVideoLinkChange = (url: string) => {
    console.log('🔗 useVideoForm handleVideoLinkChange called with:', url);
    originalHandleVideoLinkChange(url);
    handleInputChange({ target: { name: 'video_url', value: url } });
    
    if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      const thumbnailUrl = getYouTubeThumbnail(url);
      if (thumbnailUrl) {
        handleInputChange({ target: { name: 'thumbnail_url', value: thumbnailUrl } });
      }
    }
  };

  // Simplified clear
  const clearMediaFile = () => {
    console.log('🧹 useVideoForm clearMediaFile called');
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
      null,
      isYoutubeLink, 
      getYouTubeThumbnail, 
      asDraft
    );
  };

  // Simplified validation - just check if we have media
  const hasValidMedia = () => {
    const hasMedia = Boolean(mediaUrl || formState.video_url);
    
    console.log('🔍 useVideoForm hasValidMedia check:', {
      hasMedia,
      mediaUrl: mediaUrl?.substring(0, 50) + '...',
      formStateUrl: formState.video_url?.substring(0, 50) + '...'
    });
    
    return hasMedia;
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
    mediaUrl,
    mediaFile,
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
