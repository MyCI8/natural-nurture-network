
import { useNavigate, useLocation } from "react-router-dom";
import { useVideoFetch } from "./video/useVideoFetch";
import { useVideoFormState } from "./video/useVideoFormState";
import { useVideoMedia } from "./video/useVideoMedia";
import { useVideoSave } from "./video/useVideoSave";
import { useState, useEffect } from "react";

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
    mediaFiles,
    mediaPreview,
    mediaPreviews,
    isYoutubeLink,
    isCarousel,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    getYouTubeThumbnail,
    setIsYoutubeLink,
    setMediaPreview,
    setMediaPreviews
  } = useVideoMedia();
  
  const {
    isSaving,
    saveVideo: save
  } = useVideoSave();

  // Initialize form state when video is loaded
  useEffect(() => {
    if (video) {
      initializeFormFromVideo(video);
      
      if (video.media_files && video.media_files.length > 0) {
        // Handle carousel
        setMediaPreviews(video.media_files);
      } else if (video.video_url) {
        if (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be')) {
          setIsYoutubeLink(true);
          setMediaPreview(getYouTubeThumbnail(video.video_url));
        } else {
          // Regular video or single image
          setMediaPreview(video.video_url);
        }
      }
    }
  }, [video]);

  const saveVideo = async (asDraft = false) => {
    return save(
      videoId, 
      formState, 
      mediaFile, 
      mediaFiles,
      isYoutubeLink, 
      isCarousel,
      getYouTubeThumbnail, 
      asDraft
    );
  };

  return {
    formState,
    isLoading,
    isSaving,
    mediaPreview,
    mediaPreviews,
    isYoutubeLink,
    isCarousel,
    articles,
    video,
    fetchVideo,
    fetchArticles,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo
  };
}
