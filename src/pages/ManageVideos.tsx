import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  BarChart, 
  Calendar, 
  Clock, 
  Filter, 
  Flag, 
  Plus, 
  ShoppingCart, 
  Star, 
  Video as VideoIcon,
  LucideProps 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Video } from "@/types/video";

import StatsCard from "@/components/explore/dashboard/StatsCard";
import VideoMetricsChart from "@/components/explore/dashboard/VideoMetricsChart";
import TopVideosCard from "@/components/explore/dashboard/TopVideosCard";
import CategoryPerformanceCard from "@/components/explore/dashboard/CategoryPerformanceCard";
import EnhancedVideoTable from "@/components/explore/table/EnhancedVideoTable";
import AdvancedFilters, { VideoFilters } from "@/components/explore/filters/AdvancedFilters";

const generateChartData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    views: Math.floor(Math.random() * 1000) + 100,
    likes: Math.floor(Math.random() * 100) + 10,
    comments: Math.floor(Math.random() * 50) + 5,
  }));
};

const categoryData = [
  { name: 'Fitness', views: 1200, likes: 340, engagement: 8.5 },
  { name: 'Nutrition', views: 900, likes: 210, engagement: 7.2 },
  { name: 'Wellbeing', views: 1500, likes: 450, engagement: 12.1 },
  { name: 'General', views: 750, likes: 180, engagement: 6.4 },
  { name: 'Tips', views: 1100, likes: 290, engagement: 9.3 },
];

const ManageVideos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [videoType, setVideoType] = useState<"all" | "explore" | "general">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [filters, setFilters] = useState<VideoFilters>({
    search: "",
    status: "",
    category: "",
    sortBy: "recent",
    startDate: undefined,
    endDate: undefined,
    hasProductLinks: false,
    minViews: undefined,
    maxViews: undefined,
    engagement: "",
  });

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-videos", videoType, filters],
    queryFn: async () => {
      try {
        console.log(`Fetching videos with videoType: ${videoType}`);
        
        let query = supabase
          .from("videos")
          .select("*, video_product_links(count), creator:creator_id(id, full_name, username, avatar_url)");

        if (videoType !== "all") {
          const dbVideoType = videoType === "explore" ? "general" : videoType;
          console.log(`Filtering by video_type: ${dbVideoType}`);
          query = query.eq("video_type", dbVideoType);
        }

        if (filters.search) {
          query = query.ilike("title", `%${filters.search}%`);
        }

        if (filters.status) {
          query = query.eq("status", filters.status as "published" | "draft" | "archived");
        }

        if (filters.startDate && filters.endDate) {
          query = query
            .gte("created_at", filters.startDate.toISOString())
            .lte("created_at", filters.endDate.toISOString());
        }

        if (filters.sortBy === "views") {
          query = query.order("views_count", { ascending: false });
        } else if (filters.sortBy === "likes") {
          query = query.order("likes_count", { ascending: false });
        } else if (filters.sortBy === "title") {
          query = query.order("title", { ascending: true });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        console.log(`Executing video query for type: ${videoType}`);
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching videos:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} videos for type: ${videoType}`);
        
        if (data && data.length > 0) {
          const videoTypes = data.map(v => v.video_type);
          const typeCount = {};
          videoTypes.forEach(type => {
            typeCount[type] = (typeCount[type] || 0) + 1;
          });
          console.log("Video types found:", typeCount);
        }
        
        return data.map(video => ({
          ...video,
          product_links_count: video.video_product_links?.[0]?.count || 0,
          displayVideoType: video.video_type === "general" ? "explore" : video.video_type
        })) as Video[];
      } catch (error) {
        console.error("Query error:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false
  });

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
        title: "Video deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete",
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
        title: "Video archived successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to archive video",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const featureVideoMutation = useMutation({
    mutationFn: async ({ videoId, featured }: { videoId: string; featured: boolean }) => {
      const { error } = await supabase
        .from("videos")
        .update({ show_in_latest: featured })
        .eq("id", videoId);
      
      if (error) {throw error;}
      return { videoId, featured };
    },
    onSuccess: ({ videoId, featured }) => {
      toast({
        title: `Video ${featured ? 'featured' : 'unfeatured'} successfully`
      });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update feature status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleDeleteVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedVideoId) {
      deleteVideoMutation.mutate(selectedVideoId);
    }
  };

  const handleArchiveVideo = (videoId: string) => {
    archiveVideoMutation.mutate(videoId);
  };

  const handleFeatureVideo = (videoId: string, featured: boolean) => {
    featureVideoMutation.mutate({ videoId, featured });
  };

  const handleAddVideo = () => {
    navigate("/admin/videos/new", { 
      state: { 
        returnTo: "/admin/videos",
        videoType: videoType === "all" ? "explore" : videoType
      } 
    });
  };

  const handleEditVideo = (videoId: string) => {
    navigate(`/admin/videos/${videoId}`, {
      state: {
        returnTo: "/admin/videos",
        videoType: videoType
      }
    });
  };

  const handlePreviewVideo = (videoId: string) => {
    window.open(`/news/videos/${videoId}`, '_blank');
  };

  const handleViewDetails = (videoId: string) => {
    toast({
      title: "Analytics feature",
      description: "Detailed video analytics will be implemented soon.",
    });
  };

  const handleManageLinks = (videoId: string) => {
    navigate(`/admin/videos/${videoId}`, {
      state: {
        returnTo: "/admin/videos",
        videoType: videoType,
        activeTab: "products"
      }
    });
  };

  const totalVideos = videos ? videos.length : 0;
  const totalViews = videos ? videos.reduce((sum, video) => sum + (video.views_count || 0), 0) : 0;
  const totalLikes = videos ? videos.reduce((sum, video) => sum + (video.likes_count || 0), 0) : 0;
  const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "0";
  const videosWithLinks = videos ? videos.filter(v => (v as any).product_links_count > 0).length : 0;
  const publishedVideos = videos ? videos.filter(v => v.status === 'published').length : 0;
  const topVideos = videos ? [...videos].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5) : [];

  console.log("Dashboard stats:", { 
    totalVideos, 
    totalViews, 
    totalLikes, 
    engagementRate, 
    videosWithLinks, 
    publishedVideos,
    topVideosCount: topVideos.length
  });

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
            <h2 className="text-2xl font-bold">Video Management</h2>
            <p className="text-muted-foreground">
              Manage and analyze your video content
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Tabs 
            value={videoType} 
            onValueChange={(v) => {
              console.log(`Changing video type filter to: ${v}`);
              setVideoType(v as any);
            }} 
            className="mr-2"
          >
            <TabsList className="touch-manipulation">
              <TabsTrigger value="explore">Explore</TabsTrigger>
              <TabsTrigger value="general">News</TabsTrigger>
              <TabsTrigger value="all">All Videos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={handleAddVideo} className="touch-manipulation">
            <Plus className="mr-2 h-4 w-4" /> Add Video
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b pb-0 mb-6">
          <TabsTrigger value="dashboard" className="gap-2 touch-manipulation">
            <BarChart className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2 touch-manipulation">
            <VideoIcon className="h-4 w-4" />
            All Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Videos"
              value={totalVideos}
              icon={VideoIcon}
              description={`${publishedVideos} published`}
            />
            <StatsCard
              title="Total Views"
              value={totalViews.toLocaleString()}
              icon={EyeIcon}
              description="All time views"
            />
            <StatsCard
              title="Engagement Rate"
              value={`${engagementRate}%`}
              icon={Star}
              description="Likes to views ratio"
            />
            <StatsCard
              title="Product Links"
              value={videosWithLinks}
              icon={ShoppingCart}
              description={`${Math.round((videosWithLinks / totalVideos) * 100) || 0}% of videos`}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <VideoMetricsChart
              title="Weekly Performance"
              data={generateChartData()}
              description="Views and engagement over the past week"
            />
            <CategoryPerformanceCard data={categoryData} />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <TopVideosCard videos={topVideos} onViewDetails={handleViewDetails} />
            </div>
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-base font-medium mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start touch-manipulation" onClick={handleAddVideo}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Video
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-amber-700 touch-manipulation">
                    <Flag className="mr-2 h-4 w-4" /> Review Flagged Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start touch-manipulation">
                    <Calendar className="mr-2 h-4 w-4" /> Schedule Content
                  </Button>
                  <Button variant="outline" className="w-full justify-start touch-manipulation">
                    <Clock className="mr-2 h-4 w-4" /> View Watch Time
                  </Button>
                  <Button variant="outline" className="w-full justify-start touch-manipulation">
                    <Filter className="mr-2 h-4 w-4" /> Manage Categories
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <AdvancedFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />
          <EnhancedVideoTable 
            videos={videos}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onEdit={handleEditVideo}
            onDelete={handleDeleteVideo}
            onArchive={handleArchiveVideo}
            onPreview={handlePreviewVideo}
            onFeature={handleFeatureVideo}
            onManageLinks={handleManageLinks}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="touch-manipulation"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="touch-manipulation"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
};

const EyeIcon = React.forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
  return (
    <svg
      ref={ref}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
});

EyeIcon.displayName = "EyeIcon";

export default ManageVideos;
