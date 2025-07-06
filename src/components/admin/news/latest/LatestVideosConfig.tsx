
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const LatestVideosConfig = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["news-videos-config", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("videos")
        .select("id, title, thumbnail_url, video_url, created_at, show_in_latest")
        .eq("video_type", "news")
        .eq("status", "published");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) {throw error;}
      return data;
    },
  });

  const updateLatestStatusMutation = useMutation({
    mutationFn: async ({ videoId, showInLatest }: { videoId: string; showInLatest: boolean }) => {
      const { error } = await supabase
        .from("videos")
        .update({ show_in_latest: showInLatest })
        .eq("id", videoId);
      
      if (error) {throw error;}
      return { videoId, showInLatest };
    },
    onSuccess: (data) => {
      toast.success(`Video ${data.showInLatest ? 'added to' : 'removed from'} Latest Videos`);
      queryClient.invalidateQueries({ queryKey: ["news-videos-config"] });
      // Also invalidate any other queries that might depend on this data
      queryClient.invalidateQueries({ queryKey: ["admin-news-videos"] });
      queryClient.invalidateQueries({ queryKey: ["news-videos-sidebar"] });
    },
    onError: (error) => {
      console.error("Error updating video status:", error);
      toast.error("Failed to update video status");
    }
  });

  const handleToggleLatest = (videoId: string, currentValue: boolean) => {
    updateLatestStatusMutation.mutate({ 
      videoId, 
      showInLatest: !currentValue 
    });
  };

  const getYoutubeThumbnail = (url) => {
    if (!url || !url.includes('youtube.com')) {return null;}
    
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

  if (isLoading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Latest Videos Configuration</h2>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10 p-0"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Show in Latest</TableHead>
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
                      <span className="text-xs text-muted-foreground">No thumbnail</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate">
                  {video.title}
                </TableCell>
                <TableCell>{formatDate(video.created_at)}</TableCell>
                <TableCell>
                  <Switch
                    checked={video.show_in_latest}
                    onCheckedChange={() => handleToggleLatest(video.id, video.show_in_latest)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LatestVideosConfig;
