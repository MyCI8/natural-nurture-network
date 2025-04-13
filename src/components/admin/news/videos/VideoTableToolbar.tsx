
import React from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Video } from "@/types/video";
import { NavigateFunction } from "react-router-dom";

interface VideoTableToolbarProps {
  table: Table<Video>;
  navigate: NavigateFunction;
}

export const VideoTableToolbar = ({ table, navigate }: VideoTableToolbarProps) => {
  return (
    <div className="flex items-center justify-between py-4">
      <Input
        placeholder="Filter videos..."
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("title")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
      <Button 
        onClick={() => navigate("/admin/videos/new", {state: {videoType: 'news'}})}
        className="touch-manipulation"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Video
      </Button>
    </div>
  );
};

export default VideoTableToolbar;
