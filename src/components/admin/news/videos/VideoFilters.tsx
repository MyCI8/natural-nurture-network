
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface VideoFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: "recent" | "title";
  setSortBy: (value: "recent" | "title") => void;
  videoFilter: "all" | "latest" | "article" | "both";
  setVideoFilter: (value: "all" | "latest" | "article" | "both") => void;
}

const VideoFilters = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  videoFilter,
  setVideoFilter
}: VideoFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={videoFilter === "all" ? "default" : "outline"}
          onClick={() => setVideoFilter("all")}
          className="text-sm h-9"
        >
          All Videos
        </Button>
        <Button
          variant={videoFilter === "latest" ? "default" : "outline"}
          onClick={() => setVideoFilter("latest")}
          className="text-sm h-9"
        >
          Latest Videos
        </Button>
        <Button
          variant={videoFilter === "article" ? "default" : "outline"}
          onClick={() => setVideoFilter("article")}
          className="text-sm h-9"
        >
          In Articles
        </Button>
        <Button
          variant={videoFilter === "both" ? "default" : "outline"}
          onClick={() => setVideoFilter("both")}
          className="text-sm h-9"
        >
          Both
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select
          value={sortBy}
          onValueChange={(value: "recent" | "title") => setSortBy(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VideoFilters;
