
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

type SymptomType = Database['public']['Enums']['symptom_type'];

interface RemedyFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  symptomFilter: string;
  setSymptomFilter: (value: string) => void;
  sortBy: "popularity" | "recent";
  setSortBy: (value: "popularity" | "recent") => void;
  defaultSymptoms: SymptomType[];
}

const RemedyFilters = ({
  searchQuery,
  setSearchQuery,
  symptomFilter,
  setSymptomFilter,
  sortBy,
  setSortBy,
  defaultSymptoms,
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
        value={symptomFilter} 
        onValueChange={setSymptomFilter}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Filter by symptom" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Symptoms</SelectItem>
          {defaultSymptoms.map((symptom) => (
            <SelectItem key={symptom} value={symptom}>
              {symptom}
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
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="popularity">Most Popular</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RemedyFilters;
