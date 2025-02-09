
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExpertFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  expertiseFilter: string;
  setExpertiseFilter: (value: string) => void;
  sortBy: "name" | "remedies";
  setSortBy: (value: "name" | "remedies") => void;
  expertiseFields: string[];
}

const ExpertFilters = ({
  searchQuery,
  setSearchQuery,
  expertiseFilter,
  setExpertiseFilter,
  sortBy,
  setSortBy,
  expertiseFields,
}: ExpertFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="relative">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search experts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={expertiseFilter}
        onValueChange={(value) => setExpertiseFilter(value)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Filter by expertise" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="all">All Expertise</SelectItem>
          {expertiseFields.map((field) => (
            <SelectItem key={field} value={field || "unknown"}>
              {field || "Unknown"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value: "name" | "remedies") => setSortBy(value)}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="name">Name (A-Z)</SelectItem>
          <SelectItem value="remedies">Most Remedies</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExpertFilters;
