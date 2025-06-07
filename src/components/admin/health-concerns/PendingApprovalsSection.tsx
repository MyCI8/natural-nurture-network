
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, X, User } from "lucide-react";
import { format } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";

interface HealthConcernSuggestion {
  id: string;
  concern_name: string;
  suggested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_email?: string;
}

interface PendingApprovalsSectionProps {
  pendingCount: number;
  pendingSuggestions: HealthConcernSuggestion[];
  updateSuggestionMutation: UseMutationResult<void, Error, { id: string; status: 'approved' | 'rejected' }, unknown>;
}

export const PendingApprovalsSection = ({
  pendingCount,
  pendingSuggestions,
  updateSuggestionMutation
}: PendingApprovalsSectionProps) => {
  if (pendingCount === 0) return null;

  return (
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
                </div>
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
  );
};
