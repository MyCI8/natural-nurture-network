import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
  ChevronsUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
import { Video } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface VideoManagementProps {}

const VideoUsageBadge = ({ usage }: { usage: Video["usage"] }) => {
  let text, variant;

  switch (usage) {
    case "latest":
      text = "Latest";
      variant = "secondary";
      break;
    case "article":
      text = "Article";
      variant = "outline";
      break;
    case "both":
      text = "Both";
      variant = "default";
      break;
    default:
      text = "None";
      variant = "ghost";
      break;
  }

  return (
    <Badge variant={variant} className="capitalize">
      {text}
    </Badge>
  );
};

const VideoTable: React.FC<VideoManagementProps> = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          *,
          creator:creator_id (
            id,
            full_name,
            username,
            avatar_url
          )
        `
        )
        .eq("video_type", "news")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch videos",
          variant: "destructive",
        });
        console.error("Supabase error:", error);
        return;
      }

      if (data) {
        setVideos(data as Video[]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideos();

    const handleRefetchVideos = () => {
      console.log("Refetching videos due to custom event");
      fetchVideos();
    };

    window.addEventListener("refetch-news-videos", handleRefetchVideos);

    return () => {
      window.removeEventListener("refetch-news-videos", handleRefetchVideos);
    };
  }, [fetchVideos]);

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase.from("videos").delete().eq("id", id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete video",
          variant: "destructive",
        });
        console.error("Supabase error:", error);
        return;
      }

      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Unexpected error:", error);
    }
  };

  const columns: ColumnDef<Video>[] = [
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
      cell: ({ row }) => {
        const video = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/admin/videos/${video.id}`, {
                    state: { returnTo: "/admin/news/videos", videoType: "news" },
                  })
                }
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
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
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteVideo(video.id);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: videos,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter videos..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={() => navigate("/admin/videos/new", {state: {videoType: 'news'}})}>
          <Plus className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4 italic"
                >
                  Loading videos...
                </TableCell>
              </TableRow>
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4 italic"
                >
                  No videos found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoTable;
