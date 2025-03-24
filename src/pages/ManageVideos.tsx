import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Video as VideoIcon, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Video } from "@/types/video";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ManageVideos = () => {
  const navigate = useNavigate();
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
        .select("*");

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
      return data as Video[];
    },
  });

  const handleDeleteClick = (videoId: string) => {
    setDeleteVideoId(videoId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteVideoId) {
      try {
        const { error } = await supabase
          .from("videos")
          .delete()
          .eq("id", deleteVideoId);
        
        if (error) throw error;
        
        toast.success("Video deleted successfully");
        refetch();
      } catch (error: any) {
        toast.error(`Failed to delete: ${error.message}`);
      } finally {
        setIsDeleteDialogOpen(false);
        setDeleteVideoId(null);
      }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Videos</h2>
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

      <div className="space-y-6">
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
      </div>

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
            <div className="aspect-video mb-4">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                  <VideoIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="font-semibold mb-2">{video.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {video.description?.substring(0, 100) || "No description"}...
            </p>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                video.video_type === 'news' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {video.video_type === 'news' ? 'News' : 'General'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                video.status === 'published' ? 'bg-green-100 text-green-800' : 
                video.status === 'archived' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
              </span>
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
