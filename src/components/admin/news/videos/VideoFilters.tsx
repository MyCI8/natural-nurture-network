
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VideoFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: "recent" | "title";
  setSortBy: (sort: "recent" | "title") => void;
  videoFilter: "all" | "latest" | "article" | "both";
  setVideoFilter: (filter: "all" | "latest" | "article" | "both") => void;
}

const VideoFilters = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  videoFilter,
  setVideoFilter,
}: VideoFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center w-full">
      <Tabs 
        value={videoFilter} 
        onValueChange={(value) => setVideoFilter(value as any)}
        className="w-full md:w-auto"
      >
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="latest">Latest Videos</TabsTrigger>
          <TabsTrigger value="article">In Articles</TabsTrigger>
          <TabsTrigger value="both">Both</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full md:w-[250px]"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "recent" | "title")}
          className="px-3 py-2 rounded-md border text-sm border-input bg-background"
        >
          <option value="recent">Most Recent</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
};

export default VideoFilters;
