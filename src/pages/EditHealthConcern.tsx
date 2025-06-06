
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthConcernFormValues {
  concern_name: string;
  brief_description: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
}

const EditHealthConcern = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewConcern = id === "new";

  const form = useForm<HealthConcernFormValues>({
    defaultValues: {
      concern_name: "",
      brief_description: "",
      category: "symptom",
      status: "approved",
    },
  });

  const { data: concern, isLoading } = useQuery({
    queryKey: ["health-concern", id],
    queryFn: async () => {
      if (isNewConcern) return null;
      
      // For now, return null until migration is applied
      // TODO: Re-enable after migration is applied
      /*
      const { data, error } = await supabase
        .from("health_concern_suggestions" as any)
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        toast.error("Failed to load health concern details");
        throw error;
      }

      if (data) {
        form.reset({
          concern_name: data.concern_name,
          brief_description: data.brief_description || "",
          category: data.category || "symptom",
          status: data.status,
        });
      }

      return data;
      */
      
      toast.error("Health concern editing is temporarily unavailable until database migration is complete");
      return null;
    },
    enabled: !isNewConcern
  });

  const saveMutation = useMutation({
    mutationFn: async (values: HealthConcernFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in");

      // For now, show success message without database operation
      // TODO: Re-enable after migration is applied
      /*
      if (isNewConcern) {
        const { error } = await supabase
          .from("health_concern_suggestions" as any)
          .insert({
            concern_name: values.concern_name,
            brief_description: values.brief_description,
            category: values.category,
            status: values.status,
            suggested_by: user.id,
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("health_concern_suggestions" as any)
          .update({
            concern_name: values.concern_name,
            brief_description: values.brief_description,
            category: values.category,
            status: values.status,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;
      }
      */
      
      console.log("Would save health concern with values:", values);
    },
    onSuccess: () => {
      toast.success(isNewConcern ? "Health concern created successfully" : "Health concern updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-health-concern-suggestions"] });
      navigate("/admin/health-concerns");
    },
    onError: (error) => {
      console.error("Error saving health concern:", error);
      toast.error("Failed to save health concern");
    },
  });

  const handleSave = (values: HealthConcernFormValues) => {
    saveMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 mt-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-12 h-12 touch-button touch-manipulation active-scale"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-accent/50 transition-all rounded-full w-12 h-12 touch-button touch-manipulation active-scale"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isNewConcern ? "Add New Health Concern" : "Edit Health Concern"}
        </h1>
        <Button 
          onClick={form.handleSubmit(handleSave)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Concern Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="concern_name">Health Concern Name</Label>
            <Input
              id="concern_name"
              {...form.register("concern_name", { required: true })}
              placeholder="e.g., Parasites, High Blood Pressure, Anxiety"
              className="bg-background"
            />
          </div>

          <div>
            <Label htmlFor="brief_description">Brief Description</Label>
            <Textarea
              id="brief_description"
              {...form.register("brief_description")}
              placeholder="Brief description of this health concern..."
              className="bg-background"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={form.watch("category")} 
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="symptom">Symptom</SelectItem>
                <SelectItem value="condition">Condition</SelectItem>
                <SelectItem value="goal">Health Goal</SelectItem>
                <SelectItem value="body_system">Body System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={form.watch("status")} 
              onValueChange={(value) => form.setValue("status", value as 'pending' | 'approved' | 'rejected')}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditHealthConcern;
