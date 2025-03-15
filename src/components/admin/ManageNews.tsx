
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Video } from "lucide-react";
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
import type { Video as VideoType } from "@/types/video";

type VideoUsage = "latest" | "article" | "both" | "none";

const ManageNews = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "published" | "submitted">("all");
  const [contentType, setContentType] = useState<"articles" | "videos">("articles");
  const [videoFilter, setVideoFilter] = useState<"all" | "latest" | "article" | "both">("all");

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

  // Fetch all news articles to check which videos are used in articles
  const { data: allArticles = [] } = useQuery({
    queryKey: ["all-news-articles-for-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id, video_links");

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
      
      // Process videos to determine their usage
      const processedVideos = data.map((video) => {
        const videoUsage = determineVideoUsage(video.id, allArticles);
        return { ...video, usage: videoUsage };
      }).filter(video => {
        if (videoFilter === "all") return true;
        if (videoFilter === "latest") return video.usage === "latest" || video.usage === "both";
        if (videoFilter === "article") return video.usage === "article" || video.usage === "both";
        if (videoFilter === "both") return video.usage === "both";
        return true;
      });
      
      return processedVideos;
    },
    enabled: contentType === "videos",
  });

  // Determine if a video is used in the latest section, in articles, both, or none
  const determineVideoUsage = (videoId: string, articles: any[]): VideoUsage => {
    // Check if used in any article
    const usedInArticle = articles.some((article) => {
      const videoLinks = article.video_links || [];
      return videoLinks.some((link: any) => link.url && link.url.includes(videoId));
    });

    // For demonstration, we'll consider all news videos as potentially appearing in "Latest Videos"
    // In a real app, you might have a specific field in the database to track this
    const usedInLatest = true;

    if (usedInArticle && usedInLatest) return "both";
    if (usedInArticle) return "article";
    if (usedInLatest) return "latest";
    return "none";
  };

  const handleAddVideo = () => {
    navigate("/admin/videos/new", { 
      state: { 
        returnTo: "/admin/news",
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

          <VideoTable videos={videos} navigate={navigate} isLoading={isLoadingVideos} />
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

const VideoTable = ({ videos, navigate, isLoading }) => {
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
              returnTo: "/admin/news",
              videoType: "news" 
            } 
          })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add News Video
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Actions</TableHead>
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
              {video.usage === "both" ? (
                <Badge variant="outline" className="bg-purple-100 hover:bg-purple-100 text-purple-800 border-purple-200">Latest & Articles</Badge>
              ) : video.usage === "latest" ? (
                <Badge variant="outline" className="bg-blue-100 hover:bg-blue-100 text-blue-800 border-blue-200">Latest Videos</Badge>
              ) : video.usage === "article" ? (
                <Badge variant="outline" className="bg-amber-100 hover:bg-amber-100 text-amber-800 border-amber-200">In Articles</Badge>
              ) : (
                <Badge variant="outline">Unused</Badge>
              )}
            </TableCell>
            <TableCell>{video.views_count || 0}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/news/videos/${video.id}`)}
              >
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ManageNews;
