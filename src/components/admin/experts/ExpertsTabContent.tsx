
import { useState } from "react";
import ExpertListHeader from "./ExpertListHeader";
import ExpertFilters from "./ExpertFilters";
import ExpertList from "./ExpertList";
import { useExpertManagement } from "@/hooks/useExpertManagement";

const ExpertsTabContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "remedies">("name");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");

  const {
    experts,
    isLoading,
    expertiseFields,
    handleDeleteExpert,
  } = useExpertManagement({
    searchQuery,
    sortBy,
    expertiseFilter,
  });

  return (
    <div className="space-y-6">
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
        isLoading={isLoading}
        onDelete={handleDeleteExpert}
      />
    </div>
  );
};

export default ExpertsTabContent;
