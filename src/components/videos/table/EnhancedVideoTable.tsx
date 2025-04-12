
import React, { useState } from "react";
import { 
  Archive, 
  BarChart, 
  Check, 
  ChevronDown, 
  Edit, 
  ExternalLink, 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Play, 
  Plus, 
  Share2, 
  ShoppingCart, 
  Star, 
  ThumbsUp, 
  Trash2 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Video } from "@/types/video";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedVideoTableProps {
  videos: Video[];
  onViewDetails: (videoId: string) => void;
  onEdit: (videoId: string) => void;
  onDelete: (videoId: string) => void;
  onArchive: (videoId: string) => void;
  onPreview: (videoId: string) => void;
  onFeature: (videoId: string, featured: boolean) => void;
  onManageLinks: (videoId: string) => void;
  isLoading?: boolean;
}

const EnhancedVideoTable = ({
  videos,
  onViewDetails,
  onEdit,
  onDelete,
  onArchive,
  onPreview,
  onFeature,
  onManageLinks,
  isLoading = false,
}: EnhancedVideoTableProps) => {
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  
  const toggleSelectVideo = (videoId: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId);
    } else {
      newSelection.add(videoId);
    }
    setSelectedVideos(newSelection);
  };
  
  const toggleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(v => v.id)));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading videos...</div>;
  }

  if (!videos.length) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground mb-4">No videos found</p>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create New Video
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border touch-auto overflow-hidden">
        <div className="relative w-full overflow-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={toggleSelectAll}
                      >
                        {selectedVideos.size === videos.length && videos.length > 0 ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <div className="h-4 w-4 rounded border border-primary/50"></div>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select All</p>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id} className="group/row">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleSelectVideo(video.id)}
                    >
                      {selectedVideos.has(video.id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded border border-primary/50"></div>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="relative group/thumbnail flex-shrink-0">
                        <VideoThumbnail 
                          video={video} 
                          width="w-24" 
                          height="h-14"
                          className="rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity rounded-md">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white hover:text-white hover:bg-black/30"
                            onClick={() => onPreview(video.id)}
                          >
                            <Play className="h-5 w-5 fill-white" />
                          </Button>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium leading-tight line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {video.description || "No description provided"}
                        </p>
                        
                        {(video as any).product_links_count > 0 && (
                          <Badge 
                            variant="outline" 
                            className="mt-2 text-xs gap-1 bg-purple-50 border-purple-200 text-purple-700"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            {(video as any).product_links_count} Products
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{video.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{video.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">0</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`
                        ${video.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                          video.status === 'archived' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}
                      `}
                    >
                      {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {video.video_type.charAt(0).toUpperCase() + video.video_type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(video.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(video.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPreview(video.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewDetails(video.id)}>
                            <BarChart className="mr-2 h-4 w-4" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onManageLinks(video.id)}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Manage Links
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onFeature(video.id, true)}>
                            <Star className="mr-2 h-4 w-4" />
                            Feature Video
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onArchive(video.id)}
                            disabled={video.status === 'archived'}
                            className="text-amber-600"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(video.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {selectedVideos.size > 0 && (
          <div className="flex items-center justify-between bg-muted/50 p-2 border-t">
            <div className="text-sm">
              {selectedVideos.size} video{selectedVideos.size > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Archive Selected
              </Button>
              <Button size="sm" variant="outline" className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedVideoTable;
