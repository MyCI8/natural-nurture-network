
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ArticleFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: "recent" | "title";
  setSortBy: (value: "recent" | "title") => void;
  currentTab: "all" | "draft" | "published" | "submitted";
  setCurrentTab: (value: "all" | "draft" | "published" | "submitted") => void;
}

const ArticleFilters = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  currentTab,
  setCurrentTab
}: ArticleFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          variant={currentTab === "all" ? "default" : "outline"}
          onClick={() => setCurrentTab("all")}
          className="text-sm h-9"
        >
          All
        </Button>
        <Button
          variant={currentTab === "draft" ? "default" : "outline"}
          onClick={() => setCurrentTab("draft")}
          className="text-sm h-9"
        >
          Drafts
        </Button>
        <Button
          variant={currentTab === "published" ? "default" : "outline"}
          onClick={() => setCurrentTab("published")}
          className="text-sm h-9"
        >
          Published
        </Button>
        <Button
          variant={currentTab === "submitted" ? "default" : "outline"}
          onClick={() => setCurrentTab("submitted")}
          className="text-sm h-9"
        >
          Submitted
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search articles..."
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

export default ArticleFilters;
