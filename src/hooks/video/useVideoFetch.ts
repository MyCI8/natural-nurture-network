
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video } from "@/types/video";

export function useVideoFetch(videoId?: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<{id: string, title: string}[]>([]);

  const fetchVideo = async () => {
    if (!videoId) {return;}
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          creator:creator_id (
            id,
            full_name,
            username,
            avatar_url
          ),
          related_article_id
        `)
        .eq("id", videoId)
        .single();
        
      if (error) {throw error;}
      
      if (data) {
        setVideo(data as Video);
        return data;
      }
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error("Failed to load video data");
    } finally {
      setIsLoading(false);
    }
    
    return null;
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title')
        .eq('status', 'published');
        
      if (error) {throw error;}
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
    
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  return {
    video,
    isLoading,
    articles,
    fetchVideo,
    fetchArticles
  };
}
