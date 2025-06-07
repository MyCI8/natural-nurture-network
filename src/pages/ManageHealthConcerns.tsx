
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useHealthConcernManagement } from "@/hooks/useHealthConcernManagement";
import { HealthConcernStats } from "@/components/admin/health-concerns/HealthConcernStats";
import { PendingApprovalsSection } from "@/components/admin/health-concerns/PendingApprovalsSection";
import { HealthConcernFilters } from "@/components/admin/health-concerns/HealthConcernFilters";
import { HealthConcernsList } from "@/components/admin/health-concerns/HealthConcernsList";
import { getStatusIcon, getStatusVariant, getCategoryColor } from "@/components/admin/health-concerns/utils";

const ManageHealthConcerns = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const {
    suggestions,
    isLoading,
    error,
    updateSuggestionMutation,
    deleteSuggestionMutation
  } = useHealthConcernManagement(filter, searchQuery);

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const approvedCount = suggestions.filter(s => s.status === 'approved').length;
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length;
  const totalCount = suggestions.length;

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  if (error) {
    console.error("🚨 Query error in component:", error);
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Health Concerns Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage health concerns, symptoms, conditions, and wellness goals
            </p>
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">Database Error:</p>
                <p className="text-red-600 text-sm">{error.message}</p>
                <p className="text-red-600 text-xs mt-1">Check console for detailed logs</p>
              </div>
            )}
          </div>
          <Button onClick={() => navigate("/admin/health-concerns/new")} size="lg">
            <Plus className="mr-2 h-5 w-5" /> Add Health Concern
          </Button>
        </div>

        {/* Debug Information Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-700">Database Status</p>
                <p className="text-sm text-blue-600">
                  {isLoading ? "Loading..." : error ? "Error connecting to database" : "Connected successfully"}
                </p>
                {!isLoading && !error && (
                  <p className="text-xs text-blue-500 mt-1">
                    Found {totalCount} total items ({pendingCount} pending review)
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-500">Last Updated</p>
                <p className="text-xs text-blue-600">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Dashboard */}
        <HealthConcernStats
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          totalCount={totalCount}
        />

        {/* Pending Approvals Section */}
        <PendingApprovalsSection
          pendingCount={pendingCount}
          pendingSuggestions={pendingSuggestions}
          updateSuggestionMutation={updateSuggestionMutation}
          getCategoryColor={getCategoryColor}
        />

        {/* Filters and Search */}
        <HealthConcernFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />

        {/* All Health Concerns */}
        <HealthConcernsList
          suggestions={suggestions}
          isLoading={isLoading}
          error={error}
          deleteSuggestionMutation={deleteSuggestionMutation}
          getStatusIcon={getStatusIcon}
          getStatusVariant={getStatusVariant}
          getCategoryColor={getCategoryColor}
        />
      </div>
    </div>
  );
};

export default ManageHealthConcerns;
