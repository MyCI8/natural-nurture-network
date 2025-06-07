
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { UseMutationResult } from "@tanstack/react-query";
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
  suggested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  user_email?: string;
}

interface HealthConcernsListProps {
  suggestions: HealthConcernSuggestion[];
  isLoading: boolean;
  error: any;
  deleteSuggestionMutation: UseMutationResult<void, Error, string, unknown>;
  getStatusIcon: (status: string) => JSX.Element | null;
  getStatusVariant: (status: string) => string;
}

export const HealthConcernsList = ({
  suggestions,
  isLoading,
  error,
  deleteSuggestionMutation,
  getStatusIcon,
  getStatusVariant
}: HealthConcernsListProps) => {
  const navigate = useNavigate();

  return (
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
              No health concerns found matching the current filters.
            </p>
            {error && (
              <p className="text-red-600 text-sm mt-2">
                Database connection failed. Check console for details.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{suggestion.concern_name}</h3>
                      <Badge variant={getStatusVariant(suggestion.status) as any} className="flex items-center gap-1">
                        {getStatusIcon(suggestion.status)}
                        {suggestion.status}
                      </Badge>
                    </div>
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
  );
};
