
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video } from "@/types/video";

type VideoFormState = {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  showInLatest: boolean;
  status: "draft" | "published" | "archived";
  relatedArticleId: string | null;
};

export function useVideoForm(videoId?: string) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formState, setFormState] = useState<VideoFormState>({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: null,
    showInLatest: true,
    status: "draft",
    relatedArticleId: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isYoutubeLink, setIsYoutubeLink] = useState(false);
  const [articles, setArticles] = useState<{id: string, title: string}[]>([]);

  const fetchVideo = async () => {
    if (!videoId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFormState({
          title: data.title || "",
          description: data.description || "",
          videoUrl: data.video_url || "",
          thumbnailUrl: data.thumbnail_url,
          showInLatest: data.show_in_latest ?? true,
          status: data.status as "draft" | "published" | "archived",
          relatedArticleId: data.related_article_id || null,
        });

        if (data.video_url && data.video_url.includes('youtube.com')) {
          setIsYoutubeLink(true);
          setMediaPreview(getYouTubeThumbnail(data.video_url));
        }
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("Failed to load video data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title')
        .eq('status', 'published');
        
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleInputChange = (name: keyof VideoFormState, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaUpload = (file: File) => {
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setIsYoutubeLink(false);
  };

  const handleVideoLinkChange = (url: string) => {
    setFormState(prev => ({ ...prev, videoUrl: url }));
    setIsYoutubeLink(true);
    setMediaFile(null);
    
    // Try to get YouTube thumbnail
    const thumbnailUrl = getYouTubeThumbnail(url);
    setMediaPreview(thumbnailUrl);
  };

  const clearMediaFile = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
  };

  const getYouTubeThumbnail = (url: string): string | null => {
    try {
      let videoId = "";
      if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v") || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
    }
    
    return null;
  };

  const saveVideo = async (asDraft = false) => {
    if (!formState.title) {
      toast.error("Please provide a title for the video");
      return false;
    }

    if (!formState.videoUrl && !mediaFile) {
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

      let videoUrl = formState.videoUrl;
      let thumbnailUrl = formState.thumbnailUrl;
      
      // Upload media file if exists
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('video-media')
          .upload(fileName, mediaFile);

        if (uploadError) throw uploadError;

        videoUrl = supabase.storage
          .from('video-media')
          .getPublicUrl(fileName).data.publicUrl;
      }

      if (isYoutubeLink && !thumbnailUrl) {
        thumbnailUrl = getYouTubeThumbnail(formState.videoUrl);
      }

      const videoData = {
        title: formState.title,
        description: formState.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        status: (asDraft ? "draft" : "published") as "draft" | "published" | "archived",
        creator_id: user.id,
        video_type: "news",
        related_article_id: formState.relatedArticleId,
        show_in_latest: formState.showInLatest
      };

      let result;
      
      if (videoId) {
        // Update existing video
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
        // Insert new video
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

  useEffect(() => {
    // Initialize fetchArticles when component mounts
    fetchArticles();
    
    // If videoId is provided, fetch the video data
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  return {
    formState,
    isLoading,
    isSaving,
    mediaPreview,
    isYoutubeLink,
    articles,
    fetchVideo,
    fetchArticles,
    handleInputChange,
    handleMediaUpload,
    handleVideoLinkChange,
    clearMediaFile,
    saveVideo
  };
}
