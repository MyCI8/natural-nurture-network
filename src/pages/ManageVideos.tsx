
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Video as VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Video } from "@/types/video";

const ManageVideos = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "views">("recent");
  const [currentTab, setCurrentTab] = useState<"all" | "draft" | "published" | "archived">("all");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-videos", searchQuery, currentTab, sortBy],
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Videos</h2>
        <Button onClick={() => navigate("/admin/videos/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Video
        </Button>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="all" value={currentTab} onValueChange={(value: "all" | "draft" | "published" | "archived") => setCurrentTab(value)}>
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
            <VideoGrid videos={videos} navigate={navigate} />
          </TabsContent>
          <TabsContent value="draft" className="mt-6">
            <VideoGrid videos={videos} navigate={navigate} />
          </TabsContent>
          <TabsContent value="published" className="mt-6">
            <VideoGrid videos={videos} navigate={navigate} />
          </TabsContent>
          <TabsContent value="archived" className="mt-6">
            <VideoGrid videos={videos} navigate={navigate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const VideoGrid = ({ videos, navigate }: { videos: Video[], navigate: (path: string) => void }) => {
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
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                video.status === 'published' ? 'text-green-600' : 
                video.status === 'archived' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/videos/${video.id}`)}
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

export default ManageVideos;
