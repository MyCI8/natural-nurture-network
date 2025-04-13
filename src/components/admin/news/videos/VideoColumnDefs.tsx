
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Video } from "@/types/video";
import { NavigateFunction } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import VideoUsageBadge from "./VideoUsageBadge";
import VideoActions from "./VideoActions";

export const getVideoColumns = ({
  navigate,
  onDelete,
  onArchive,
}: {
  navigate: NavigateFunction;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}): ColumnDef<Video>[] => [
  {
    id: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => (
      <VideoThumbnail video={row.original} width="w-24" height="h-14" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="touch-manipulation"
        >
          Title
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "creator.full_name",
    header: "Creator",
    cell: ({ row }) => row.original.creator?.full_name || "Unknown",
  },
  {
    accessorKey: "views_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="touch-manipulation"
        >
          Views
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "likes_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="touch-manipulation"
        >
          Likes
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => <VideoUsageBadge usage={row.original.usage || "none"} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <VideoActions
        video={row.original}
        navigate={navigate}
        onDelete={onDelete}
        onArchive={onArchive}
      />
    ),
  },
];
