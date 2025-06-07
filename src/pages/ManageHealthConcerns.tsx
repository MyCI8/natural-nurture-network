
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Clock, User, Plus, Edit2, Trash2, Search, AlertCircle, TrendingUp, Archive, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HealthConcernSuggestion {
  id: string;
  concern_name: string;
  brief_description?: string;
  category?: string;
  suggested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_email?: string;
  symptom_id?: string;
  has_detailed_content?: boolean;
}

const ManageHealthConcerns = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ["admin-health-concern-suggestions", filter, searchQuery],
    queryFn: async () => {
      console.log("Fetching health concern suggestions...");
      
      try {
        // First try to fetch from health_concern_suggestions table (using type casting)
        let query = supabase
          .from("health_concern_suggestions" as any)
          .select(`
            id,
            concern_name,
            category,
            suggested_by,
            status,
            created_at,
            reviewed_at,
            reviewed_by,
            symptom_id,
            has_detailed_content
          `);
        
        if (filter !== 'all') {
          query = query.eq("status", filter);
        }
        
        if (searchQuery) {
          query = query.ilike("concern_name", `%${searchQuery}%`);
        }
        
        const { data: healthConcerns, error: healthConcernsError } = await query.order("created_at", { ascending: false });
        
        console.log("Health concerns data:", healthConcerns);
        console.log("Health concerns error:", healthConcernsError);
        
        // If table doesn't exist or has errors, fetch from symptom_details as fallback
        let allConcerns: any[] = [];
        
        if (healthConcernsError || !healthConcerns) {
          console.log("Fetching from symptom_details as fallback...");
          
          // Fetch from symptom_details table
          let symptomQuery = supabase
            .from("symptom_details")
            .select("id, symptom, description, brief_description, created_at");
          
          if (searchQuery) {
            symptomQuery = symptomQuery.ilike("symptom", `%${searchQuery}%`);
          }
          
          const { data: symptoms, error: symptomsError } = await symptomQuery.order("created_at", { ascending: false });
          
          if (symptoms && !symptomsError) {
            // Convert symptoms to health concern format
            allConcerns = symptoms.map((symptom: any) => ({
              id: symptom.id,
              concern_name: symptom.symptom,
              brief_description: symptom.brief_description || symptom.description,
              category: 'symptom',
              suggested_by: 'system',
              status: 'approved',
              created_at: symptom.created_at,
              reviewed_at: symptom.created_at,
              reviewed_by: 'system',
              user_email: 'System',
              symptom_id: symptom.id,
              has_detailed_content: true
            }));
          }
        } else {
          allConcerns = healthConcerns || [];
        }
        
        // Get user emails for the suggestions
        const userIds = [...new Set(allConcerns.map(item => item.suggested_by).filter(Boolean).filter(id => id !== 'system'))];
        let userEmails: Record<string, string> = {};
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email")
            .in("id", userIds);
          
          if (profiles) {
            userEmails = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile.email || 'Unknown';
              return acc;
            }, {} as Record<string, string>);
          }
        }
        
        return allConcerns.map((item: any) => ({
          id: item.id,
          concern_name: item.concern_name,
          brief_description: item.brief_description,
          category: item.category,
          suggested_by: item.suggested_by,
          status: item.status,
          created_at: item.created_at,
          reviewed_at: item.reviewed_at,
          reviewed_by: item.reviewed_by,
          user_email: userEmails[item.suggested_by] || (item.suggested_by === 'system' ? 'System' : 'Unknown'),
          symptom_id: item.symptom_id,
          has_detailed_content: item.has_detailed_content
        })) as HealthConcernSuggestion[];
        
      } catch (error) {
        console.error("Error in health concerns query:", error);
        return [];
      }
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from("health_concern_suggestions" as any)
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Health concern ${variables.status} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concern-suggestions"] });
    },
    onError: (error) => {
      console.error("Error updating suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive",
      });
    },
  });

  const deleteSuggestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("health_concern_suggestions" as any)
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Health concern deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-health-concern-suggestions"] });
    },
    onError: (error) => {
      console.error("Error deleting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to delete health concern",
        variant: "destructive",
      });
    },
  });

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const approvedCount = suggestions.filter(s => s.status === 'approved').length;
  const rejectedCount = suggestions.filter(s => s.status === 'rejected').length;
  const totalCount = suggestions.length;
  const migratedCount = suggestions.filter(s => s.symptom_id).length;

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'symptom':
        return 'bg-blue-100 text-blue-800';
      case 'condition':
        return 'bg-red-100 text-red-800';
      case 'goal':
        return 'bg-green-100 text-green-800';
      case 'body_system':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetailedContent = (symptomId: string) => {
    navigate(`/symptoms/${symptomId}`);
  };

  if (error) {
    console.error("Query error:", error);
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
              {migratedCount > 0 && ` (${migratedCount} migrated from symptoms)`}
            </p>
            {error && (
              <p className="text-red-600 text-sm mt-1">
                Error loading data. Showing fallback symptom data.
              </p>
            )}
          </div>
          <Button onClick={() => navigate("/admin/health-concerns/new")} size="lg">
            <Plus className="mr-2 h-5 w-5" /> Add Health Concern
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Symptoms</p>
                  <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{totalCount}</p>
                </div>
                <Archive className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        {isLoading && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-muted-foreground">Loading health concerns...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && suggestions.length === 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <p className="text-orange-700">
                No health concerns found. The migration may not have run yet. Check the database console for the health_concern_suggestions table.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pending Approvals Section */}
        {pendingCount > 0 && (
          <div className="mb-8">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {pendingCount} Item{pendingCount !== 1 ? 's' : ''} Awaiting Your Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-white rounded-lg border p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{suggestion.concern_name}</h3>
                        {suggestion.category && (
                          <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                            {suggestion.category.replace('_', ' ')}
                          </Badge>
                        )}
                        {suggestion.has_detailed_content && (
                          <Badge variant="outline" className="text-xs">
                            Rich Content
                          </Badge>
                        )}
                      </div>
                      {suggestion.brief_description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.brief_description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {suggestion.user_email}
                        </div>
                        <div>
                          Suggested {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => updateSuggestionMutation.mutate({
                          id: suggestion.id,
                          status: 'approved'
                        })}
                        disabled={updateSuggestionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateSuggestionMutation.mutate({
                          id: suggestion.id,
                          status: 'rejected'
                        })}
                        disabled={updateSuggestionMutation.isPending}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search health concerns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* All Health Concerns */}
        <Card>
          <CardHeader>
            <CardTitle>All Health Concerns ({suggestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading health concerns...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No health concerns found. Check database migration status.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{suggestion.concern_name}</h3>
                          {suggestion.category && (
                            <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                              {suggestion.category.replace('_', ' ')}
                            </Badge>
                          )}
                          <Badge variant={getStatusVariant(suggestion.status) as any} className="flex items-center gap-1">
                            {getStatusIcon(suggestion.status)}
                            {suggestion.status}
                          </Badge>
                          {suggestion.symptom_id && (
                            <Badge variant="outline" className="text-xs text-blue-600">
                              Has Detailed Content
                            </Badge>
                          )}
                        </div>
                        {suggestion.brief_description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {suggestion.brief_description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {suggestion.user_email}
                          </div>
                          <div>
                            Created {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                          </div>
                          {suggestion.reviewed_at && (
                            <div>
                              Reviewed {format(new Date(suggestion.reviewed_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {suggestion.symptom_id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetailedContent(suggestion.symptom_id!)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/health-concerns/${suggestion.id}`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Health Concern</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{suggestion.concern_name}"? This action cannot be undone.
                                {suggestion.symptom_id && (
                                  <span className="block mt-2 text-orange-600">
                                    Note: This will only remove the health concern entry. The original symptom data will be preserved.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSuggestionMutation.mutate(suggestion.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageHealthConcerns;
