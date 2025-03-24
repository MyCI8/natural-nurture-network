import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Video, Trash2, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { VideoUsageBadge } from "./news/video/VideoUsageBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Video as VideoType } from "@/types/video";

type VideoUsage = "latest" | "article" | "both" | "none";

const ManageNews = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "published" | "submitted">("all");
  const [contentType, setContentType] = useState<"articles" | "videos">("articles");
  const [videoFilter, setVideoFilter] = useState<"all" | "latest" | "article" | "both">("all");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'videos') {
      setContentType('videos');
    }
  }, [location]);

  const { data: articles = [], isLoading: isLoadingArticles } = useQuery({
    queryKey: ["admin-news", searchQuery, currentTab, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("news_articles")
        .select("*");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (currentTab !== "all") {
        query = query.eq("status", currentTab);
      }

      if (sortBy === "title") {
        query = query.order("title", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: contentType === "articles",
  });

  const { data: allArticles = [] } = useQuery({
    queryKey: ["all-news-articles-for-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id, title, video_links");

      if (error) throw error;
      return data;
    },
    enabled: contentType === "videos",
  });

  const { data: videos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ["admin-news-videos", searchQuery, videoFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("videos")
        .select("*")
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
      if (error) throw error;
      
      console.log("Raw videos from query:", data); // Debug log
      
      const processedVideos = data.map((video) => {
        const videoUsageData = determineVideoUsage(video.id, allArticles);
        return { 
          ...video, 
          usage: videoUsageData.usage,
          relatedArticleTitle: videoUsageData.articleTitle
        };
      }).filter(video => {
        if (videoFilter === "all") return true;
        if (videoFilter === "latest") return video.show_in_latest && (video.usage === "latest" || video.usage === "both");
        if (videoFilter === "article") return video.usage === "article" || video.usage === "both";
        if (videoFilter === "both") return video.usage === "both";
        return true;
      });
      
      console.log("Processed videos after filtering:", processedVideos); // Debug log
      return processedVideos;
    },
    enabled: contentType === "videos",
  });

  const determineVideoUsage = (videoId: string, articles: any[]): { usage: VideoUsage, articleTitle?: string } => {
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

    const usedInLatest = true;

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
      toast.success("Video deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-news-videos"] });
    },
    onError: (error) => {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
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
      toast.success("Video archived successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-news-videos"] });
    },
    onError: (error) => {
      console.error("Error archiving video:", error);
      toast.error("Failed to archive video");
    }
  });

  const handleAddVideo = () => {
    navigate("/admin/videos/new", { 
      state: { 
        returnTo: "/admin/news?tab=videos",
        videoType: "news" 
      } 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage News Articles</h2>
        <div className="flex space-x-2">
          <Button onClick={handleAddVideo} variant="outline">
            <Video className="mr-2 h-4 w-4" /> + Video
          </Button>
          <Button onClick={() => navigate("/admin/news/new")}>
            <Plus className="mr-2 h-4 w-4" /> + News
          </Button>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <Button 
          variant={contentType === "articles" ? "default" : "outline"}
          onClick={() => setContentType("articles")}
        >
          Articles
        </Button>
        <Button 
          variant={contentType === "videos" ? "default" : "outline"}
          onClick={() => setContentType("videos")}
        >
          Videos
        </Button>
      </div>

      {contentType === "articles" ? (
        <div className="space-y-6">
          <Tabs defaultValue="all" value={currentTab} onValueChange={(value: "all" | "draft" | "published" | "submitted") => setCurrentTab(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Articles</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select
                  value={sortBy}
                  onValueChange={(value: "recent" | "title") => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              <ArticleGrid articles={articles} navigate={navigate} />
            </TabsContent>
            <TabsContent value="draft" className="mt-6">
              <ArticleGrid articles={articles} navigate={navigate} />
            </TabsContent>
            <TabsContent value="published" className="mt-6">
              <ArticleGrid articles={articles} navigate={navigate} />
            </TabsContent>
            <TabsContent value="submitted" className="mt-6">
              <ArticleGrid articles={articles} navigate={navigate} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mb-6">
            <Tabs defaultValue="all" value={videoFilter} onValueChange={(value: "all" | "latest" | "article" | "both") => setVideoFilter(value)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Videos</TabsTrigger>
                <TabsTrigger value="latest">Latest Videos</TabsTrigger>
                <TabsTrigger value="article">In Articles</TabsTrigger>
                <TabsTrigger value="both">Both</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={(value: "recent" | "title") => setSortBy(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <VideoTable 
            videos={videos} 
            navigate={navigate} 
            isLoading={isLoadingVideos} 
            onDelete={(id) => deleteVideoMutation.mutate(id)}
            onArchive={(id) => archiveVideoMutation.mutate(id)}
          />
        </div>
      )}
    </div>
  );
};

const ArticleGrid = ({ articles, navigate }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardContent className="p-4">
            <div className="aspect-video mb-4">
              <img
                src={article.image_url || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {article.content.substring(0, 100)}...
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                article.status === 'published' ? 'text-green-600' : 
                article.status === 'submitted' ? 'text-blue-600' : 
                'text-yellow-600'
              }`}>
                {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/news/${article.id}`)}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface VideoTableProps {
  videos: any[];
  navigate: (path: string) => void;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const VideoTable = ({ videos, navigate, isLoading, onDelete, onArchive }: VideoTableProps) => {
  if (isLoading) {
    return <div>Loading videos...</div>;
  }

  if (!videos.length) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No videos found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/admin/videos/new", { 
            state: { 
              returnTo: "/admin/news?tab=videos",
              videoType: "news" 
            } 
          })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add News Video
        </Button>
      </div>
    );
  }

  const getYoutubeThumbnail = (url) => {
    if (!url || !url.includes('youtube.com')) return null;
    
    try {
      const videoId = url.includes('v=') 
        ? new URLSearchParams(new URL(url).search).get('v')
        : url.split('youtu.be/')[1]?.split('?')[0];
        
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
    }
    
    return null;
  };

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thumbnail</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Views</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id}>
              <TableCell>
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title} 
                    className="w-16 h-10 object-cover rounded"
                  />
                ) : video.video_url && video.video_url.includes('youtube.com') ? (
                  <img 
                    src={getYoutubeThumbnail(video.video_url)} 
                    alt={video.title} 
                    className="w-16 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-10 bg-muted flex items-center justify-center rounded">
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{video.title}</TableCell>
              <TableCell>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  video.status === 'published' ? 'bg-green-100 text-green-800' : 
                  video.status === 'archived' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                {React.createElement(VideoUsageBadge, {
                  usage: video.usage,
                  articleTitle: video.relatedArticleTitle,
                  showInLatest: video.showInLatest
                })}
              </TableCell>
              <TableCell>{video.views_count || 0}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/news/videos/${video.id}`)}
                  >
                    Edit
                  </Button>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onArchive(video.id)}
                        className="h-8 w-8"
                        disabled={video.status === 'archived'}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Archive Video</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this video? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(video.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};

export default ManageNews;
