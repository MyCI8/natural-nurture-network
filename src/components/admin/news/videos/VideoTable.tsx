
import React from "react";
import { useNavigate } from "react-router-dom";
import { Video, Archive, Trash2, Plus, ShoppingCart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VideoUsageBadge } from "../video/VideoUsageBadge";
import { formatDate } from "@/lib/utils";
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
import { Video as VideoType } from "@/types/video";

interface VideoTableProps {
  videos: VideoType[];
  navigate: (path: string) => void;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const VideoTable = ({ videos, navigate, isLoading, onDelete, onArchive }: VideoTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  if (!videos.length) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No videos found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/admin/videos/new?type=news")}
        >
          <Plus className="mr-2 h-4 w-4" /> Add News Video
        </Button>
      </div>
    );
  }

  const getYoutubeVideoId = (url: string | null): string | null => {
    if (!url) return null;
    
    try {
      // Match both youtube.com/watch?v= and youtu.be/ formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
      return null;
    }
  };

  const getThumbnailUrl = (video: VideoType): string | null => {
    // First check if video has a direct thumbnail
    if (video.thumbnail_url) {
      return video.thumbnail_url;
    }
    
    // Then check if it's a YouTube video and get thumbnail from the video_url
    if (video.video_url) {
      const videoId = getYoutubeVideoId(video.video_url);
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    
    return null;
  };

  return (
    <TooltipProvider>
      <div className="touch-auto overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Product Links</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>
                  {getThumbnailUrl(video) ? (
                    <img 
                      src={getThumbnailUrl(video)} 
                      alt={video.title} 
                      className="w-16 h-10 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x90/f0f0f0/404040?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-10 bg-muted flex items-center justify-center rounded">
                      <Video className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{video.title}</TableCell>
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
                  <VideoUsageBadge
                    usage={video.usage}
                    articleTitle={video.relatedArticleTitle}
                    showInLatest={video.show_in_latest}
                  />
                </TableCell>
                <TableCell>
                  {(video as any).product_links_count > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      {(video as any).product_links_count}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell>{video.views_count || 0}</TableCell>
                <TableCell>{formatDate(video.created_at)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/videos/${video.id}`, {
                        state: { 
                          returnTo: "/admin/news/videos",
                          videoType: "news" 
                        }
                      })}
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
      </div>
    </TooltipProvider>
  );
};

export default VideoTable;
