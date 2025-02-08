
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ExpertListHeader from "./experts/ExpertListHeader";
import ExpertFilters from "./experts/ExpertFilters";
import ExpertList from "./experts/ExpertList";
import SuggestionsList from "./experts/SuggestionsList";
import { useExpertManagement } from "@/hooks/useExpertManagement";
import { useSuggestionManagement } from "@/hooks/useSuggestionManagement";

const ManageExpertsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "remedies">("name");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");

  const {
    experts,
    expertiseFields,
    handleDeleteExpert,
  } = useExpertManagement(searchQuery, sortBy, expertiseFilter);

  const {
    suggestions,
    handleApproveSuggestion,
    handleRejectSuggestion,
  } = useSuggestionManagement();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="experts">
        <TabsList>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions
            {suggestions.filter(s => s.status === "pending").length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {suggestions.filter(s => s.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experts">
          <ExpertListHeader />
          <ExpertFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            expertiseFilter={expertiseFilter}
            setExpertiseFilter={setExpertiseFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            expertiseFields={expertiseFields}
          />
          <ExpertList 
            experts={experts}
            onDelete={handleDeleteExpert}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsList
            suggestions={suggestions}
            onApprove={handleApproveSuggestion}
            onReject={handleRejectSuggestion}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageExpertsList;
