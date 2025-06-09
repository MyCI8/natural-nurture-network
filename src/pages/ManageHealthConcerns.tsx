
import { useState } from "react";
import { ArrowLeft, Plus, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHealthConcernManagement } from "@/hooks/useHealthConcernManagement";
import { HealthConcernsList } from "@/components/admin/health-concerns/HealthConcernsList";

const ManageHealthConcerns = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const {
    healthConcerns,
    isLoading,
    error,
    deleteHealthConcernMutation
  } = useHealthConcernManagement(filter, searchQuery);

  const handleAddNew = () => {
    // Show a toast for now since we're using static data
    alert("Database migration pending. New health concerns will be available after migration is applied.");
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Health Concerns</h1>
            <p className="text-muted-foreground">
              Add, edit, and manage health concerns in your system
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Health Concern
          </Button>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Currently showing static health concerns data. Database operations will be available after migration is applied.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search health concerns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(value: 'all' | 'recent') => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter concerns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Concerns</SelectItem>
              <SelectItem value="recent">Recent (30 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <HealthConcernsList
          healthConcerns={healthConcerns}
          isLoading={isLoading}
          error={error}
          deleteHealthConcernMutation={deleteHealthConcernMutation}
        />
      </div>
    </div>
  );
};

export default ManageHealthConcerns;
