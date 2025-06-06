
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Clock, User, Plus, Edit2, Trash2, Search } from "lucide-react";
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
}

const ManageHealthConcerns = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["admin-health-concern-suggestions", filter, searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from("health_concern_suggestions")
          .select(`
            *,
            profiles!health_concern_suggestions_suggested_by_fkey(email)
          `)
          .order("created_at", { ascending: false });

        if (filter !== 'all') {
          query = query.eq("status", filter);
        }

        if (searchQuery) {
          query = query.ilike("concern_name", `%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((item: any) => ({
          ...item,
          user_email: item.profiles?.email || 'Unknown user'
        })) as HealthConcernSuggestion[];
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
      }
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("health_concern_suggestions")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Health concern ${variables.status}`,
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
        .from("health_concern_suggestions")
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

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Health Concerns</h1>
            <p className="text-muted-foreground">
              Manage health concerns, symptoms, conditions, and goals used in "Applicable For" selections
            </p>
          </div>
          <Button onClick={() => navigate("/admin/health-concerns/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Health Concern
          </Button>
        </div>

        {pendingCount > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {pendingCount} Pending Suggestion{pendingCount !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

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

        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Loading health concerns...</p>
              </CardContent>
            </Card>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No health concerns found</p>
              </CardContent>
            </Card>
          ) : (
            suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{suggestion.concern_name}</CardTitle>
                      {suggestion.category && (
                        <Badge variant="outline" className="capitalize">
                          {suggestion.category.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={getStatusVariant(suggestion.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(suggestion.status)}
                      {suggestion.status}
                    </Badge>
                  </div>
                  {suggestion.brief_description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {suggestion.brief_description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {suggestion.user_email}
                      </div>
                      <div>
                        Suggested {format(new Date(suggestion.created_at), 'MMM d, yyyy')}
                      </div>
                      {suggestion.reviewed_at && (
                        <div>
                          Reviewed {format(new Date(suggestion.reviewed_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSuggestionMutation.mutate({
                              id: suggestion.id,
                              status: 'approved'
                            })}
                            disabled={updateSuggestionMutation.isPending}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <Check className="h-3 w-3 mr-1" />
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
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/health-concerns/${suggestion.id}`)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Health Concern</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{suggestion.concern_name}"? This action cannot be undone.
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageHealthConcerns;
