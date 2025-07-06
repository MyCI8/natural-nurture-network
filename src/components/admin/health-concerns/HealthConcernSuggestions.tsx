
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

export const HealthConcernSuggestions = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["admin-health-concern-suggestions", filter],
    queryFn: async () => {
      try {
        let query = supabase
          .from("health_concern_suggestions" as any)
          .select(`
            *,
            profiles!health_concern_suggestions_suggested_by_fkey(email)
          `)
          .order("created_at", { ascending: false });

        if (filter !== 'all') {
          query = query.eq("status", filter);
        }

        const { data, error } = await query;
        if (error) {throw error;}

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
      if (!user) {throw new Error("Must be logged in");}

      const { error } = await supabase
        .from("health_concern_suggestions" as any)
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq("id", id);

      if (error) {throw error;}
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: `Suggestion ${variables.status}`,
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

  if (isLoading) {
    return <div>Loading suggestions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Concern Suggestions</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption)}
              className="capitalize"
            >
              {filterOption}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {suggestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No suggestions found</p>
            </CardContent>
          </Card>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{suggestion.concern_name}</CardTitle>
                  <Badge variant={getStatusVariant(suggestion.status) as any} className="flex items-center gap-1">
                    {getStatusIcon(suggestion.status)}
                    {suggestion.status}
                  </Badge>
                </div>
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
                  
                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
