
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const ManageSymptoms = () => {
  const { data: symptoms, isLoading } = useQuery({
    queryKey: ["symptoms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("symptom_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Symptoms</h1>
      </div>

      {isLoading ? (
        <div>Loading symptoms...</div>
      ) : symptoms?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              No Symptoms Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No symptoms have been added yet. Start by adding your first symptom.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {symptoms?.map((symptom) => (
            <Card key={symptom.id}>
              <CardHeader>
                <CardTitle>{symptom.symptom}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {symptom.brief_description || "No description available"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSymptoms;
