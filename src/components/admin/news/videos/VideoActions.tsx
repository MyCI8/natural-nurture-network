
import React from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { NavigateFunction } from "react-router-dom";
import { Video } from "@/types/video";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Button } from "@/components/ui/button";

interface VideoActionsProps {
  video: Video;
  navigate: NavigateFunction;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const VideoActions = ({ 
  video, 
  navigate, 
  onDelete, 
  onArchive 
}: VideoActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 min-w-[44px] min-h-[44px] touch-manipulation">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="solid-dropdown">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            navigate(`/admin/videos/${video.id}`, {
              state: { returnTo: "/admin/news/videos", videoType: "news" },
            })
          }
          className="cursor-pointer touch-manipulation min-h-[44px]"
        >
          <Edit className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              className="cursor-pointer focus:bg-destructive focus:text-destructive-foreground touch-manipulation min-h-[44px]"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete
                the video from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="touch-manipulation min-h-[44px]">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(video.id);
                }}
                className="touch-manipulation min-h-[44px]"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VideoActions;
