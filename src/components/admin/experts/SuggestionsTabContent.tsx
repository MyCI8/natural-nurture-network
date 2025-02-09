
import SuggestionsList from "./SuggestionsList";
import { useSuggestionManagement } from "@/hooks/useSuggestionManagement";

const SuggestionsTabContent = () => {
  const {
    suggestions,
    handleApproveSuggestion,
    handleRejectSuggestion,
  } = useSuggestionManagement();

  return (
    <SuggestionsList
      suggestions={suggestions}
      onApprove={handleApproveSuggestion}
      onReject={handleRejectSuggestion}
    />
  );
};

export default SuggestionsTabContent;
