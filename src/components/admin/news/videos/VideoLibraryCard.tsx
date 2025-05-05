
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoFilters from "./VideoFilters";
import VideoTable from "./VideoTable";
import { Video } from "@/types/video";
import { VideoFiltersState } from "@/hooks/useNewsVideos";

interface VideoLibraryCardProps {
  videos: Video[];
  navigate: NavigateFunction;
  isLoading: boolean;
  filters: VideoFiltersState;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "recent" | "title") => void;
  setVideoFilter: (filter: "all" | "latest" | "article" | "both") => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

const VideoLibraryCard: React.FC<VideoLibraryCardProps> = ({
  videos,
  navigate,
  isLoading,
  filters,
  setSearchQuery,
  setSortBy,
  setVideoFilter,
  onDelete,
  onArchive
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Video Library</CardTitle>
      </CardHeader>
      <CardContent>
        <VideoFilters
          searchQuery={filters.searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={filters.sortBy}
          setSortBy={setSortBy}
          videoFilter={filters.videoFilter}
          setVideoFilter={setVideoFilter}
        />

        <div className="mt-4">
          <VideoTable 
            videos={videos} 
            navigate={navigate} 
            isLoading={isLoading} 
            onDelete={onDelete}
            onArchive={onArchive}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoLibraryCard;
