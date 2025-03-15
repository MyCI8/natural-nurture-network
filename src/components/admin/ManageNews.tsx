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

const ManageNews = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title">("recent");
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "published" | "submitted">("all");
  const [contentType, setContentType] = useState<"articles" | "videos">("articles");

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

  const { data: videos = [], isLoading: isLoadingVideos } = useQuery({
    queryKey: ["admin-news-videos", searchQuery, sortBy],
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
      return data;
    },
    enabled: contentType === "videos",
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage News Articles</h2>
        <div className="flex space-x-2">
          <Button onClick={() => navigate("/admin/videos/new")} variant="outline">
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
          onClick={() => navigate("/admin/videos/new")}
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
            <TableCell>{video.views_count || 0}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/videos/${video.id}`)}
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
