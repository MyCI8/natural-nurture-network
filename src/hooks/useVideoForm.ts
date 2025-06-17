
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
    isProcessing,
    handleMediaUpload: originalHandleMediaUpload,
    handleVideoLinkChange: originalHandleVideoLinkChange,
    clearMediaFile: originalClearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    hasValidMedia,
    getCurrentMediaType
  } = useVideoMedia();
  
  const {
    isSaving,
    saveVideo: save
  } = useVideoSave();

  // Store the current media type for form state
  const [currentMediaType, setCurrentMediaType] = useState<string>('unknown');

  // Enhanced media upload that syncs with form state
  const handleMediaUpload = async (file: File) => {
    console.log('handleMediaUpload called with:', file.name);
    try {
      const mediaData = await originalHandleMediaUpload(file);
      if (mediaData && mediaData.previewUrl) {
        console.log('Setting video_url to:', mediaData.previewUrl);
        handleInputChange({ target: { name: 'video_url', value: mediaData.previewUrl } });
        setCurrentMediaType(mediaData.mediaType);
        toast.success("Media ready for preview", {
          description: `Your ${mediaData.mediaType} has been processed.`,
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
      setCurrentMediaType('youtube');
      const thumbnailUrl = getYouTubeThumbnail(url);
      if (thumbnailUrl) {
        handleInputChange({ target: { name: 'thumbnail_url', value: thumbnailUrl } });
      }
    } else {
      setCurrentMediaType('unknown');
    }
  };

  // Enhanced clear that syncs with form state
  const clearMediaFile = () => {
    console.log('clearMediaFile called');
    originalClearMediaFile();
    handleInputChange({ target: { name: 'video_url', value: '' } });
    handleInputChange({ target: { name: 'thumbnail_url', value: '' } });
    setCurrentMediaType('unknown');
  };

  // Initialize form state when video is loaded
  useEffect(() => {
    if (video) {
      initializeFormFromVideo(video);
      
      if (video.video_url && (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be'))) {
        setIsYoutubeLink(true);
        setCurrentMediaType('youtube');
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

  const hasValidMediaCheck = () => {
    const hasFormUrl = Boolean(formState.video_url && formState.video_url.length > 0);
    const hasMediaFile = hasValidMedia();
    console.log('hasValidMedia check:', {
      hasFormUrl,
      hasMediaFile,
      formStateVideoUrl: formState.video_url,
      currentMediaType
    });
    return hasFormUrl || hasMediaFile;
  };

  return {
    formState,
    isLoading,
    isSaving,
    isProcessing,
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
    hasValidMedia: hasValidMediaCheck,
    getCurrentMediaType: () => currentMediaType || getCurrentMediaType()
  };
}
