
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, User, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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

// Mock pending suggestions - replace with real data when available
const mockPendingSuggestions: HealthConcernSuggestion[] = [
  {
    id: "1",
    concern_name: "Parasites",
    brief_description: "Intestinal and other parasitic infections",
    category: "condition",
    suggested_by: "user1",
    status: "pending",
    created_at: new Date().toISOString(),
    user_email: "user@example.com"
  },
  {
    id: "2", 
    concern_name: "Heavy Metal Detox",
    brief_description: "Removal of heavy metals from the body",
    category: "goal",
    suggested_by: "user2",
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_email: "expert@example.com"
  }
];

const PendingHealthConcerns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingSuggestions] = useState(mockPendingSuggestions);

  const updateSuggestionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      // Mock implementation for now
      console.log(`Would update suggestion ${id} to status: ${status}`);
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

  if (pendingSuggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Health Concerns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No pending health concerns to review.
          </p>
          <Button 
            variant="outline" 
            className="mt-3"
            onClick={() => navigate("/admin/health-concerns")}
          >
            Manage All Health Concerns
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="text-orange-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {pendingSuggestions.length} Health Concern{pendingSuggestions.length !== 1 ? 's' : ''} Awaiting Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingSuggestions.slice(0, 3).map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{suggestion.concern_name}</h3>
                  {suggestion.category && (
                    <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category.replace('_', ' ')}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
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
          </div>
        ))}
        
        {pendingSuggestions.length > 3 && (
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/admin/health-concerns")}
            >
              View All {pendingSuggestions.length} Pending Health Concerns
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        {pendingSuggestions.length <= 3 && (
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/admin/health-concerns")}
            >
              Manage All Health Concerns
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingHealthConcerns;
