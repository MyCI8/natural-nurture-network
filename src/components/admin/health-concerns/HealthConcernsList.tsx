
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
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

interface HealthConcern {
  id: string;
  name: string;
  brief_description?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface HealthConcernsListProps {
  healthConcerns: HealthConcern[];
  isLoading: boolean;
  error: any;
  deleteHealthConcernMutation: UseMutationResult<void, Error, string, unknown>;
}

export const HealthConcernsList = ({
  healthConcerns,
  isLoading,
  error,
  deleteHealthConcernMutation
}: HealthConcernsListProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Health Concerns ({healthConcerns.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading health concerns...</p>
          </div>
        ) : healthConcerns.length === 0 ? (
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
            {healthConcerns.map((concern) => (
              <div key={concern.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{concern.name}</h3>
                    </div>
                    {concern.brief_description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {concern.brief_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div>
                        Created {format(new Date(concern.created_at), 'MMM d, yyyy')}
                      </div>
                      {concern.updated_at !== concern.created_at && (
                        <div>
                          Updated {format(new Date(concern.updated_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/health-concerns/${concern.id}`)}
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
                            Are you sure you want to delete "{concern.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteHealthConcernMutation.mutate(concern.id)}
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
