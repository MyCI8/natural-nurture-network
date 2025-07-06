
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Search, PencilIcon, ExternalLink, Trash2, VideoIcon } from 'lucide-react';
import type { Video } from '@/types/video';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminVideos = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: videos = [], isLoading, refetch } = useQuery({
    queryKey: ["dashboard-videos", searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("videos")
        .select("*")
        .eq("video_type", "news");

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.order("created_at", { ascending: false }).limit(6);

      const { data, error } = await query;
      if (error) {throw error;}
      
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
        
        if (error) {throw error;}
        
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

  const getYoutubeVideoId = (url: string) => {
    if (!url) {return null;}
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>News Videos</CardTitle>
        <Button onClick={() => navigate("/admin/videos/new", { state: { videoType: "news" } })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: 'all' | 'draft' | 'published' | 'archived') => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate("/admin/videos")}>
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No videos found</p>
            <Button onClick={() => navigate("/admin/videos/new", { state: { videoType: "news" } })}>
              <Plus className="mr-2 h-4 w-4" /> Add News Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <AspectRatio ratio={16/9} className="bg-gray-100">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : video.video_url && getYoutubeVideoId(video.video_url) ? (
                      <img
                        src={`https://img.youtube.com/vi/${getYoutubeVideoId(video.video_url)}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <VideoIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 text-black"
                          onClick={() => navigate(`/news/videos/${video.id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 text-black"
                          onClick={() => navigate(`/admin/videos/${video.id}`)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(video.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AspectRatio>
                  <div className="p-3">
                    <h3 className="font-medium line-clamp-1">{video.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        video.status === 'published' ? 'bg-green-100 text-green-800' : 
                        video.status === 'archived' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">{video.views_count} views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

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
    </Card>
  );
};

export default AdminVideos;
