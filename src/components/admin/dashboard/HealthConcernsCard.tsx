
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, AlertCircle, Check, X, ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface HealthConcernSuggestion {
  id: string;
  concern_name: string;
  brief_description?: string;
  category?: string;
  suggested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_email?: string;
}

const HealthConcernsCard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthConcernsData, isLoading } = useQuery({
    queryKey: ["health-concerns-overview"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("health_concern_suggestions" as any)
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching health concerns:", error);
          return { total: 0, pending: 0, approved: 0, pendingSuggestions: [] };
        }
        
        const suggestions = (data || []).map((item: any) => ({
          id: item.id,
          concern_name: item.concern_name,
          brief_description: item.brief_description,
          category: item.category,
          suggested_by: item.suggested_by,
          status: item.status,
          created_at: item.created_at,
          user_email: item.user_email || 'Anonymous'
        })) as HealthConcernSuggestion[];

        const pending = suggestions.filter(s => s.status === 'pending');
        const approved = suggestions.filter(s => s.status === 'approved');

        return {
          total: suggestions.length,
          pending: pending.length,
          approved: approved.length,
          pendingSuggestions: pending.slice(0, 2) // Show first 2 pending items
        };
      } catch (error) {
        console.error("Health concerns table might not exist:", error);
        return { total: 0, pending: 0, approved: 0, pendingSuggestions: [] };
      }
    },
  });

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      try {
        const { error } = await supabase
          .from("health_concern_suggestions" as any)
          .update({ 
            status, 
            reviewed_at: new Date().toISOString(),
            reviewed_by: (await supabase.auth.getUser()).data.user?.id 
          })
          .eq("id", id);
        
        if (error) throw error;
      } catch (error) {
        console.error("Error updating suggestion:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Health concern ${variables.status} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["health-concerns-overview"] });
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

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Concerns Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const { total, pending, approved, pendingSuggestions } = healthConcernsData || { total: 0, pending: 0, approved: 0, pendingSuggestions: [] };

  return (
    <Card className={`col-span-2 ${pending > 0 ? 'border-orange-200 bg-orange-50/30' : ''}`}>
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${pending > 0 ? 'text-orange-700' : ''}`}>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Concerns Management
            {pending > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pending} pending
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/admin/health-concerns")}
          >
            Manage All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Pending Items */}
        {pending > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-orange-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Approvals
            </h4>
            {pendingSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium">{suggestion.concern_name}</h5>
                      {suggestion.category && (
                        <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Suggested {format(new Date(suggestion.created_at), 'MMM d')} by {suggestion.user_email}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateSuggestionMutation.mutate({
                        id: suggestion.id,
                        status: 'approved'
                      })}
                      disabled={updateSuggestionMutation.isPending}
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateSuggestionMutation.mutate({
                        id: suggestion.id,
                        status: 'rejected'
                      })}
                      disabled={updateSuggestionMutation.isPending}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {pending > 2 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/admin/health-concerns")}
              >
                View {pending - 2} more pending items
              </Button>
            )}
          </div>
        )}

        {/* No pending items */}
        {pending === 0 && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">All caught up!</span>
            </div>
            <p className="text-sm text-muted-foreground">No pending health concerns to review</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthConcernsCard;
