
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Video as VideoIcon, 
  Flag, 
  Users, 
  MessageSquare, 
  Heart, 
  Filter, 
  Search, 
  ArrowLeft, 
  MoreVertical,
  EyeOff,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Video as VideoType } from "@/types/video";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface UserVideo extends VideoType {
  creator?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
  };
  comments_count: number;
  is_flagged?: boolean;
  flags_count?: number;
}

const UserVideoManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState<"all" | "flagged" | "archived">("all");
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null);
  const [isVideoDetailsOpen, setIsVideoDetailsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "likes" | "views" | "flags">("recent");

  // Use this when database is ready to track flagged videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-user-videos", searchQuery, currentTab, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("videos")
        .select(`
          *,
          creator:creator_id (
            id,
            username,
            avatar_url,
            full_name
          ),
          video_comments(count)
        `)
        .neq('video_type', 'news');

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (currentTab === "archived") {
        query = query.eq("status", "archived");
      } else if (currentTab === "flagged") {
        // This would filter by flagged videos once we implement the flagging system
        // For now, we'll just show all videos in this tab
        query = query.eq("status", "published");
      } else {
        // "all" tab shows all except archived
        query = query.neq("status", "archived");
      }

      switch (sortBy) {
        case "likes":
          query = query.order("likes_count", { ascending: false });
          break;
        case "views":
          query = query.order("views_count", { ascending: false });
          break;
        case "flags":
          // We'll implement this when we have the flags feature
          query = query.order("created_at", { ascending: false });
          break;
        case "recent":
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Mock flagged videos for demonstration purposes
      // This should be replaced with actual flag data from the database
      const mockFlaggedVideoIds = new Set(['video-id-1', 'video-id-2']);
      const mockFlagCounts = { 'video-id-1': 3, 'video-id-2': 7 };
      
      return data.map(video => ({
        ...video,
        comments_count: video.video_comments?.[0]?.count || 0,
        is_flagged: mockFlaggedVideoIds.has(video.id),
        flags_count: mockFlagCounts[video.id] || 0
      })) as UserVideo[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["user-videos-stats"],
    queryFn: async () => {
      // In a real implementation, you would fetch these stats from the database
      // For now, we'll calculate them from the videos we already have
      return {
        totalVideos: videos.length,
        totalViews: videos.reduce((sum, v) => sum + (v.views_count || 0), 0),
        totalLikes: videos.reduce((sum, v) => sum + (v.likes_count || 0), 0),
        totalComments: videos.reduce((sum, v) => sum + (v.comments_count || 0), 0),
        flaggedCount: videos.filter(v => v.is_flagged).length,
        activeUsers: new Set(videos.map(v => v.creator_id).filter(Boolean)).size
      };
    },
    enabled: videos.length > 0
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
      queryClient.invalidateQueries({ queryKey: ["admin-user-videos"] });
    },
    onError: (error: any) => {
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
        title: "Video archived successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-user-videos"] });
      setIsVideoDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to archive video",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const restoreVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from("videos")
        .update({ status: "published" })
        .eq("id", videoId);
      
      if (error) throw error;
      return videoId;
    },
    onSuccess: () => {
      toast({
        title: "Video restored successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-user-videos"] });
      setIsVideoDetailsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to restore video",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // For handling flags in the future
  const clearFlagMutation = useMutation({
    mutationFn: async (videoId: string) => {
      // This would clear flags in the database
      // For now, we'll just simulate success
      console.log("Clearing flags for video:", videoId);
      return videoId;
    },
    onSuccess: () => {
      toast({
        title: "Flags cleared successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-user-videos"] });
      setIsVideoDetailsOpen(false);
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

  const handleViewDetails = (video: UserVideo) => {
    setSelectedVideo(video);
    setIsVideoDetailsOpen(true);
  };

  const getYoutubeThumbnail = (url: string | null): string | null => {
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
            <h2 className="text-2xl font-bold">User Videos</h2>
            <p className="text-muted-foreground">
              Monitor and moderate user-generated video content
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalVideos || 0}</p>
              </div>
              <VideoIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">User-generated content</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold mt-1">{(stats?.totalViews || 0).toLocaleString()}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active users: {stats?.activeUsers || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                <p className="text-2xl font-bold mt-1">{(stats?.totalLikes || 0).toLocaleString()}</p>
              </div>
              <Heart className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Comments: {(stats?.totalComments || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged Content</p>
                <p className="text-2xl font-bold mt-1">{stats?.flaggedCount || 0}</p>
              </div>
              <Flag className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requiring moderation</p>
          </CardContent>
        </Card>
      </div>

      {/* Video List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Video Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={currentTab} 
            onValueChange={(value: "all" | "flagged" | "archived") => setCurrentTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Videos</TabsTrigger>
              <TabsTrigger value="flagged">
                Flagged
                {stats?.flaggedCount ? (
                  <Badge variant="destructive" className="ml-2">{stats.flaggedCount}</Badge>
                ) : null}
              </TabsTrigger>
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

                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value: "recent" | "likes" | "views" | "flags") => setSortBy(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                      <SelectItem value="likes">Most Liked</SelectItem>
                      <SelectItem value="flags">Most Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading videos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No videos found</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                    <div className="w-full md:w-1/4">
                      <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : video.video_url && video.video_url.includes('youtube.com') ? (
                          <img
                            src={getYoutubeThumbnail(video.video_url)}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <VideoIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </AspectRatio>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{video.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              {video.creator?.avatar_url ? 
                                <AvatarImage src={video.creator.avatar_url} /> : 
                                <AvatarFallback>{video.creator?.username?.[0] || 'U'}</AvatarFallback>
                              }
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {video.creator?.username || 'Anonymous'} · {new Date(video.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(video)}>
                              View Details
                            </DropdownMenuItem>
                            {video.status !== 'archived' ? (
                              <DropdownMenuItem onClick={() => archiveVideoMutation.mutate(video.id)}>
                                Archive Video
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => restoreVideoMutation.mutate(video.id)}>
                                Restore Video
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(video.id)}
                              className="text-destructive"
                            >
                              Delete Video
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {video.description || "No description provided"}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{video.views_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{video.likes_count || 0} likes</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                          <span>{video.comments_count || 0} comments</span>
                        </div>
                        
                        {video.is_flagged && (
                          <Badge variant="destructive" className="gap-1">
                            <Flag className="h-3 w-3" />
                            {video.flags_count || 0} flags
                          </Badge>
                        )}
                        
                        <Badge className={
                          video.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                          video.status === 'archived' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 
                          'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }>
                          {video.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Details Dialog */}
      {selectedVideo && (
        <Dialog open={isVideoDetailsOpen} onOpenChange={setIsVideoDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Video Details</DialogTitle>
              <DialogDescription>
                {selectedVideo.creator?.username && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      {selectedVideo.creator?.avatar_url ? 
                        <AvatarImage src={selectedVideo.creator.avatar_url} /> : 
                        <AvatarFallback>{selectedVideo.creator?.username?.[0] || 'U'}</AvatarFallback>
                      }
                    </Avatar>
                    <span>Uploaded by {selectedVideo.creator?.username}</span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <AspectRatio ratio={16/9} className="bg-muted rounded-md overflow-hidden">
                {selectedVideo.video_url && selectedVideo.video_url.includes('youtube.com') ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeThumbnail(selectedVideo.video_url)?.split('/')[4]}`}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : selectedVideo.thumbnail_url ? (
                  <img
                    src={selectedVideo.thumbnail_url}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </AspectRatio>
              
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedVideo.description}</p>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{selectedVideo.views_count || 0} views</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Heart className="h-4 w-4" />
                  <span>{selectedVideo.likes_count || 0} likes</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <span>{selectedVideo.comments_count || 0} comments</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Badge className={`${
                    selectedVideo.status === 'published' ? 'bg-green-100 text-green-800' : 
                    selectedVideo.status === 'archived' ? 'bg-orange-100 text-orange-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedVideo.status}
                  </Badge>
                </div>
              </div>
              
              {selectedVideo.is_flagged && (
                <div className="border border-red-200 bg-red-50 rounded-md p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800">Content Flagged</h4>
                      <p className="text-sm text-red-700 mt-1">
                        This video has been flagged {selectedVideo.flags_count} times by users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              {selectedVideo.is_flagged && (
                <Button 
                  variant="outline" 
                  onClick={() => clearFlagMutation.mutate(selectedVideo.id)}
                  className="w-full sm:w-auto"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Clear Flags
                </Button>
              )}
              
              {selectedVideo.status !== 'archived' ? (
                <Button 
                  variant="outline" 
                  onClick={() => archiveVideoMutation.mutate(selectedVideo.id)}
                  className="w-full sm:w-auto"
                >
                  <EyeOff className="mr-2 h-4 w-4" />
                  Archive Video
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => restoreVideoMutation.mutate(selectedVideo.id)}
                  className="w-full sm:w-auto"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Restore Video
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                onClick={() => {
                  setIsVideoDetailsOpen(false);
                  handleDeleteClick(selectedVideo.id);
                }}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Delete Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserVideoManagement;
