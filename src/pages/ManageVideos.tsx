
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Video as VideoIcon, Trash2, ExternalLink, ArrowLeft, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Video } from "@/types/video";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

const ManageVideos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "views">("recent");
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "published" | "archived">("all");
  const [videoType, setVideoType] = useState<"all" | "general" | "news" | "explore">("all");
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-videos", searchQuery, currentTab, sortBy, videoType],
    queryFn: async () => {
      let query = supabase
        .from("videos")
        .select("*, video_product_links(count)");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (currentTab !== "all") {
        query = query.eq("status", currentTab);
      }

      if (videoType !== "all") {
        query = query.eq("video_type", videoType);
      } else {
        query = query.not('video_type', 'eq', 'news');
      }

      if (sortBy === "views") {
        query = query.order("views_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(video => ({
        ...video,
        product_links_count: video.video_product_links?.[0]?.count || 0
      })) as Video[];
    },
  });

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
        title: "Video deleted successfully"
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDeleteClick = (videoId: string) => {
    setDeleteVideoId(videoId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteVideoId) {
      deleteVideoMutation.mutate(deleteVideoId);
      setIsDeleteDialogOpen(false);
      setDeleteVideoId(null);
    }
  };

  const handleAddVideo = () => {
    const videoTypeParam = videoType !== 'all' ? videoType : 'general';
    navigate("/admin/videos/new", { 
      state: { 
        returnTo: "/admin/videos",
        videoType: videoTypeParam
      } 
    });
  };

  const renderVideoStats = () => {
    // Calculate video statistics
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + (video.views_count || 0), 0);
    const videosWithLinks = videos.filter(video => 
      (video as any).product_links_count && (video as any).product_links_count > 0
    ).length;
    const publishedVideos = videos.filter(video => video.status === 'published').length;

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold mt-1">{totalVideos}</p>
              </div>
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{publishedVideos} published</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold mt-1">{totalViews.toLocaleString()}</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all videos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Links</p>
                <p className="text-2xl font-bold mt-1">{videosWithLinks}</p>
              </div>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((videosWithLinks / totalVideos) * 100) || 0}% of videos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Video Types</p>
                <p className="text-2xl font-bold mt-1">
                  {videos.filter(v => v.video_type === 'general').length} / {videos.filter(v => v.video_type === 'explore').length}
                </p>
              </div>
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">General / Explore</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/admin")}
            className="mr-2 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Manage Videos</h2>
            <p className="text-muted-foreground">
              Create and manage general and explore videos
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select 
            value={videoType} 
            onValueChange={(value: "all" | "general" | "news" | "explore") => setVideoType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Video Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="general">General Videos</SelectItem>
              <SelectItem value="explore">Explore Videos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddVideo}>
            <Plus className="mr-2 h-4 w-4" /> Add New Video
          </Button>
        </div>
      </div>

      {renderVideoStats()}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Video Library</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={currentTab} 
            onValueChange={(value: "all" | "draft" | "published" | "archived") => setCurrentTab(value)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Videos</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

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
                  onValueChange={(value: "recent" | "views") => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              <VideoGrid 
                videos={videos} 
                navigate={navigate} 
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
            <TabsContent value="draft" className="mt-6">
              <VideoGrid 
                videos={videos} 
                navigate={navigate}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
            <TabsContent value="published" className="mt-6">
              <VideoGrid 
                videos={videos} 
                navigate={navigate}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
            <TabsContent value="archived" className="mt-6">
              <VideoGrid 
                videos={videos} 
                navigate={navigate}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const VideoGrid = ({ 
  videos, 
  navigate, 
  onDeleteClick 
}: { 
  videos: Video[], 
  navigate: (path: string) => void,
  onDeleteClick: (id: string) => void
}) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No videos found</p>
        <Button onClick={() => navigate("/admin/videos/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Video
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <Card key={video.id}>
          <CardContent className="p-4">
            <AspectRatio ratio={16/9} className="mb-4 bg-muted rounded-md overflow-hidden">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </AspectRatio>
            <h3 className="font-semibold mb-2">{video.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {video.description?.substring(0, 100) || "No description"}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                video.video_type === 'news' ? 'bg-blue-100 text-blue-800' : 
                video.video_type === 'explore' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {video.video_type.charAt(0).toUpperCase() + video.video_type.slice(1)}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                video.status === 'published' ? 'bg-green-100 text-green-800' : 
                video.status === 'archived' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
              </span>
              
              {(video as any).product_links_count > 0 && (
                <Badge variant="outline" className="gap-1 bg-purple-50 border-purple-200 text-purple-700">
                  <ShoppingCart className="h-3 w-3" />
                  {(video as any).product_links_count}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {video.views_count} views
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/news/videos/${video.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/videos/${video.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDeleteClick(video.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManageVideos;
