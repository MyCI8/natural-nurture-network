
import React from "react";
import { useNavigate } from "react-router-dom";
import { Archive, Trash2, Plus, ShoppingCart } from "lucide-react";
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
import VideoThumbnail from "@/components/video/VideoThumbnail";

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
                  <VideoThumbnail video={video} />
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
                      className="h-9 text-sm"
                    >
                      Edit
                    </Button>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onArchive(video.id)}
                          className="h-9 w-9 touch-manipulation"
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
                          className="h-9 w-9 text-destructive hover:text-destructive/90 hover:bg-destructive/10 touch-manipulation"
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
