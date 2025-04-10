
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Video, Archive, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import VideoTable from "./VideoTable";
import VideoFilters from "./VideoFilters";
import { Video as VideoType } from "@/types/video";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoStatsCards from "./VideoStatsCards";

const VideoManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [videoFilter, setVideoFilter] = useState<"all" | "latest" | "article" | "both">("latest");

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

      if (error) throw error;
      return data;
    },
  });

  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-news-videos", searchQuery, videoFilter, sortBy],
    queryFn: async () => {
      console.log("Fetching news videos with filter:", videoFilter);
      
      let query = supabase
        .from("videos")
        .select("*, related_article_id, video_product_links(count)")
        .eq("video_type", "news");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (sortBy === "title") {
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
          related_article_id: video.related_article_id || null, // Ensure related_article_id is always defined
          product_links_count: video.video_product_links?.[0]?.count || 0
        };
      }).filter(video => {
        if (videoFilter === "all") return true;
        if (videoFilter === "latest") return video.show_in_latest;
        if (videoFilter === "article") return video.usage === "article" || video.usage === "both";
        if (videoFilter === "both") return video.usage === "both";
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

    if (usedInArticle && usedInLatest) return { usage: "both", articleTitle };
    if (usedInArticle) return { usage: "article", articleTitle };
    if (usedInLatest) return { usage: "latest" };
    return { usage: "none" };
  };

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);
      
      if (error) throw error;
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
      
      if (error) throw error;
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

  const handleAddVideo = () => {
    navigate("/admin/videos/new", { 
      state: { 
        returnTo: "/admin/news/videos",
        videoType: "news" 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/admin/news")}
            className="mr-2 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Manage News Videos</h2>
            <p className="text-muted-foreground">
              Create and manage videos for news content
            </p>
          </div>
        </div>
        <Button onClick={handleAddVideo}>
          <Plus className="mr-2 h-4 w-4" /> Create News Video
        </Button>
      </div>

      <VideoStatsCards videos={videos} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Video Library</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            videoFilter={videoFilter}
            setVideoFilter={setVideoFilter}
          />

          <div className="mt-4">
            <VideoTable 
              videos={videos} 
              navigate={navigate} 
              isLoading={isLoading} 
              onDelete={(id) => deleteVideoMutation.mutate(id)}
              onArchive={(id) => archiveVideoMutation.mutate(id)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoManagement;
