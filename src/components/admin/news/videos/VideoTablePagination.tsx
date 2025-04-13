
import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Video } from "@/types/video";

interface VideoTablePaginationProps {
  table: Table<Video>;
}

export const VideoTablePagination = ({ table }: VideoTablePaginationProps) => {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="touch-manipulation"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="touch-manipulation"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default VideoTablePagination;
