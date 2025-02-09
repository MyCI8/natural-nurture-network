
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ExpertsTabContent from "./experts/ExpertsTabContent";
import SuggestionsTabContent from "./experts/SuggestionsTabContent";
import { useSuggestionManagement } from "@/hooks/useSuggestionManagement";

const ManageExpertsList = () => {
  const { suggestions } = useSuggestionManagement();
  const pendingSuggestionsCount = suggestions.filter(s => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="experts">
        <TabsList>
          <TabsTrigger value="experts">Experts</TabsTrigger>
          <TabsTrigger value="suggestions" className="relative">
            Suggestions
            {pendingSuggestionsCount > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {pendingSuggestionsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="experts">
          <ExpertsTabContent />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestionsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageExpertsList;
