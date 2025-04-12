
import React, { useState } from "react";
import { Search, Filter, SlidersHorizontal, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface VideoFilters {
  search: string;
  status: string;
  category: string;
  sortBy: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  hasProductLinks: boolean;
  minViews: number | undefined;
  maxViews: number | undefined;
  engagement: string;
}

interface AdvancedFiltersProps {
  filters: VideoFilters;
  onFilterChange: (filters: VideoFilters) => void;
  savedFilters?: { name: string; filters: VideoFilters }[];
  onSaveFilter?: (name: string, filters: VideoFilters) => void;
}

const AdvancedFilters = ({
  filters,
  onFilterChange,
  savedFilters = [],
  onSaveFilter,
}: AdvancedFiltersProps) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [showSaveFilterPrompt, setShowSaveFilterPrompt] = useState(false);
  
  const activeFilterCount = Object.values(filters).filter(value => {
    if (typeof value === 'boolean') return value;
    if (value === undefined || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length - 1; // -1 because we don't count the sortBy filter
  
  const handleFilterChange = (partialFilters: Partial<VideoFilters>) => {
    onFilterChange({ ...filters, ...partialFilters });
  };
  
  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      status: "",
      category: "",
      sortBy: filters.sortBy,
      startDate: undefined,
      endDate: undefined,
      hasProductLinks: false,
      minViews: undefined,
      maxViews: undefined,
      engagement: "",
    });
  };
  
  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    onSaveFilter?.(filterName, filters);
    setFilterName("");
    setShowSaveFilterPrompt(false);
  };
  
  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search videos..."
            className="pl-8 w-full"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="engagement">Highest Engagement</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Advanced Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {showFilterPanel && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 border rounded-md bg-card">
          <div>
            <p className="text-sm font-medium mb-2">Status</p>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Category</p>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any category</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="explore">Explore</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="wellbeing">Wellbeing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Date Range</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate && filters.endDate ? (
                    <>
                      {format(filters.startDate, "PP")} -{" "}
                      {format(filters.endDate, "PP")}
                    </>
                  ) : (
                    <span>Any date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.startDate,
                    to: filters.endDate,
                  }}
                  onSelect={(range) => {
                    handleFilterChange({
                      startDate: range?.from,
                      endDate: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Engagement</p>
            <Select
              value={filters.engagement}
              onValueChange={(value) => handleFilterChange({ engagement: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any engagement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any engagement</SelectItem>
                <SelectItem value="high">High (>10%)</SelectItem>
                <SelectItem value="medium">Medium (5-10%)</SelectItem>
                <SelectItem value="low">Low (<5%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-full">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="more-filters" className="border-0">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    <span>More Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="checkbox"
                        id="product-links"
                        className="h-4 w-4"
                        checked={filters.hasProductLinks}
                        onChange={(e) => handleFilterChange({ hasProductLinks: e.target.checked })}
                      />
                      <label htmlFor="product-links" className="text-sm cursor-pointer">
                        Has product links
                      </label>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Min Views</p>
                      <Input
                        type="number"
                        placeholder="Any"
                        min={0}
                        value={filters.minViews || ""}
                        onChange={(e) => handleFilterChange({ minViews: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Max Views</p>
                      <Input
                        type="number"
                        placeholder="Any"
                        min={0}
                        value={filters.maxViews || ""}
                        onChange={(e) => handleFilterChange({ maxViews: e.target.value ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="col-span-full flex justify-between items-center">
            <div className="flex gap-2">
              {savedFilters.length > 0 && (
                <Select onValueChange={(value) => {
                  const savedFilter = savedFilters.find(f => f.name === value);
                  if (savedFilter) {
                    onFilterChange(savedFilter.filters);
                  }
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Saved filters" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedFilters.map((filter) => (
                      <SelectItem key={filter.name} value={filter.name}>
                        {filter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {onSaveFilter && (
                <Popover open={showSaveFilterPrompt} onOpenChange={setShowSaveFilterPrompt}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-10"
                      onClick={() => setShowSaveFilterPrompt(true)}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Save Filter Preset</h4>
                      <Input
                        placeholder="Filter name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowSaveFilterPrompt(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleSaveFilter}
                          disabled={!filterName.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearFilters}
              className="h-10"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      )}
      
      {activeFilterCount > 0 && !showFilterPanel && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ status: "" })}
              />
            </Badge>
          )}
          
          {filters.category && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Category: {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ category: "" })}
              />
            </Badge>
          )}
          
          {filters.startDate && filters.endDate && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Date: {format(filters.startDate, "PP")} - {format(filters.endDate, "PP")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ startDate: undefined, endDate: undefined })}
              />
            </Badge>
          )}
          
          {filters.hasProductLinks && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Has product links
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ hasProductLinks: false })}
              />
            </Badge>
          )}
          
          {filters.minViews !== undefined && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Min views: {filters.minViews}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ minViews: undefined })}
              />
            </Badge>
          )}
          
          {filters.maxViews !== undefined && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Max views: {filters.maxViews}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ maxViews: undefined })}
              />
            </Badge>
          )}
          
          {filters.engagement && (
            <Badge variant="outline" className="px-2 py-1 h-auto gap-1">
              Engagement: {filters.engagement}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange({ engagement: "" })}
              />
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={handleClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
