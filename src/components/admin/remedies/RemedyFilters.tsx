
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";

interface RemedyFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  healthConcernFilter: string;
  setHealthConcernFilter: (value: string) => void;
  sortBy: "popularity" | "recent";
  setSortBy: (value: "popularity" | "recent") => void;
  defaultHealthConcerns: string[];
}

const RemedyFilters = ({
  searchQuery,
  setSearchQuery,
  healthConcernFilter,
  setHealthConcernFilter,
  sortBy,
  setSortBy,
  defaultHealthConcerns,
}: RemedyFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="relative">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search remedies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 bg-background"
        />
      </div>

      <Select 
        value={healthConcernFilter} 
        onValueChange={setHealthConcernFilter}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Filter by health concern" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="all">All Health Concerns</SelectItem>
          {defaultHealthConcerns.map((concern) => (
            <SelectItem key={concern} value={concern}>
              {concern}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value: "popularity" | "recent") => setSortBy(value)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="popularity">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RemedyFilters;
