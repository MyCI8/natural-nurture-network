
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Video } from "@/types/video";

export interface VideoFiltersState {
  searchQuery: string;
  sortBy: "recent" | "title";
  videoFilter: "all" | "latest" | "article" | "both";
}

export function useNewsVideos() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<VideoFiltersState>({
    searchQuery: "",
    sortBy: "recent",
    videoFilter: "latest"
  });

  // Setup event listener for refetch
  useEffect(() => {
    const handleRefetch = () => {
      console.log("Refetching news videos from event");
      refetch();
    };
    
    window.addEventListener("refetch-news-videos", handleRefetch);
    
    return () => {
      window.removeEventListener("refetch-news-videos", handleRefetch);
    };
  }, []);

  const { data: allArticles = [] } = useQuery({
    queryKey: ["all-news-articles-for-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id, title, video_links");

      if (error) {throw error;}
      return data;
    },
  });

  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-news-videos", filters.searchQuery, filters.videoFilter, filters.sortBy],
    queryFn: async () => {
      console.log("Fetching news videos with filter:", filters.videoFilter);
      
      let query = supabase
        .from("videos")
        .select("*, related_article_id, video_product_links(count)")
        .eq("video_type", "news");

      if (filters.searchQuery) {
        query = query.ilike("title", `%${filters.searchQuery}%`);
      }

      if (filters.sortBy === "title") {
        query = query.order("title", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching videos:", error);
        throw error;
      }
      
      console.log("Fetched videos:", data);
      
      const processedVideos = data.map((video) => {
        const videoUsageData = determineVideoUsage(video.id, allArticles, video);
        return { 
          ...video, 
          usage: videoUsageData.usage,
          relatedArticleTitle: videoUsageData.articleTitle,
          related_article_id: video.related_article_id || null,
          product_links_count: video.video_product_links?.[0]?.count || 0
        };
      }).filter(video => {
        if (filters.videoFilter === "all") {return true;}
        if (filters.videoFilter === "latest") {return video.show_in_latest;}
        if (filters.videoFilter === "article") {return video.usage === "article" || video.usage === "both";}
        if (filters.videoFilter === "both") {return video.usage === "both";}
        return true;
      });
      
      console.log("Processed videos:", processedVideos);
      return processedVideos;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 10000 // Short stale time to ensure fresh data
  });

  const determineVideoUsage = (
    videoId: string, 
    articles: any[], 
    video: any
  ): { usage: "latest" | "article" | "both" | "none", articleTitle?: string } => {
    let articleTitle;
    
    const usedInArticle = articles.some((article) => {
      const videoLinks = article.video_links || [];
      const isUsed = videoLinks.some((link: any) => 
        (link.url && (
          link.url === videoId || 
          link.url.includes(`/videos/${videoId}`) ||
          (link.url.includes('youtube.com') && link.videoId === videoId)
        ))
      );
      
      if (isUsed) {
        articleTitle = article.title;
      }
      
      return isUsed;
    });

    // Check if it's marked to show in latest videos section
    const usedInLatest = video.show_in_latest;

    if (usedInArticle && usedInLatest) {return { usage: "both", articleTitle };}
    if (usedInArticle) {return { usage: "article", articleTitle };}
    if (usedInLatest) {return { usage: "latest" };}
    return { usage: "none" };
  };

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);
      
      if (error) {throw error;}
      return videoId;
    },
    onSuccess: () => {
      toast({
        title: "Video deleted successfully",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-news-videos"] });
    },
    onError: (error) => {
      console.error("Error deleting video:", error);
      toast({
        title: "Failed to delete video",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const archiveVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("videos")
        .update({ status: "archived" })
        .eq("id", videoId);
      
      if (error) {throw error;}
      return videoId;
    },
    onSuccess: () => {
      toast({
        title: "Video archived successfully",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-news-videos"] });
    },
    onError: (error) => {
      console.error("Error archiving video:", error);
      toast({
        title: "Failed to archive video",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const setSearchQuery = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  };

  const setSortBy = (sortBy: "recent" | "title") => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const setVideoFilter = (videoFilter: "all" | "latest" | "article" | "both") => {
    setFilters(prev => ({ ...prev, videoFilter }));
  };

  return {
    videos,
    isLoading,
    filters,
    setSearchQuery,
    setSortBy,
    setVideoFilter,
    deleteVideo: (id: string) => deleteVideoMutation.mutate(id),
    archiveVideo: (id: string) => archiveVideoMutation.mutate(id)
  };
}
