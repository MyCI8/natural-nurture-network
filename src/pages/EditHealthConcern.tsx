
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
      
      try {
        const { data, error } = await supabase
          .from("health_concern_suggestions" as any)
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          console.error("Error fetching health concern:", error);
          return null;
        }
        
        if (data) {
          // Type assertion to safely access properties
          const typedData = data as any;
          form.reset({
            concern_name: typedData.concern_name || "",
            brief_description: typedData.brief_description || "",
            category: typedData.category || "symptom",
            status: typedData.status || "pending",
          });
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching health concern:", error);
        return null;
      }
    },
    enabled: !isNewConcern
  });

  const saveMutation = useMutation({
    mutationFn: async (values: HealthConcernFormValues) => {
      try {
        if (isNewConcern) {
          const { data: user } = await supabase.auth.getUser();
          const { error } = await supabase
            .from("health_concern_suggestions" as any)
            .insert({
              concern_name: values.concern_name,
              brief_description: values.brief_description,
              category: values.category,
              status: values.status,
              suggested_by: user.user?.id
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
            })
            .eq("id", id);
          
          if (error) throw error;
        }
      } catch (error) {
        console.error("Error saving health concern:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(isNewConcern ? "Health concern created successfully" : "Health concern updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-health-concern-suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
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
    <div className="container mx-auto p-6 mt-20 max-w-4xl">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-accent/50 transition-all rounded-full w-12 h-12 touch-button touch-manipulation active-scale"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isNewConcern ? "Add New Health Concern" : "Edit Health Concern"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isNewConcern 
              ? "Create a new health concern that users can select when posting remedies"
              : "Update the details of this health concern"
            }
          </p>
        </div>
        <Button 
          onClick={form.handleSubmit(handleSave)}
          disabled={saveMutation.isPending}
          size="lg"
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
            <Label htmlFor="concern_name" className="text-sm font-medium">
              Health Concern Name *
            </Label>
            <Input
              id="concern_name"
              {...form.register("concern_name", { required: true })}
              placeholder="e.g., Parasites, High Blood Pressure, Anxiety"
              className="bg-background mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a clear, descriptive name for this health concern
            </p>
          </div>

          <div>
            <Label htmlFor="brief_description" className="text-sm font-medium">
              Brief Description
            </Label>
            <Textarea
              id="brief_description"
              {...form.register("brief_description")}
              placeholder="Brief description of this health concern..."
              className="bg-background mt-2"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Provide a brief description to help users understand this concern
            </p>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select 
              value={form.watch("category")} 
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger className="bg-background mt-2">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="symptom">Symptom</SelectItem>
                <SelectItem value="condition">Condition</SelectItem>
                <SelectItem value="goal">Health Goal</SelectItem>
                <SelectItem value="body_system">Body System</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the most appropriate category for this health concern
            </p>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium">
              Status *
            </Label>
            <Select 
              value={form.watch("status")} 
              onValueChange={(value) => form.setValue("status", value as 'pending' | 'approved' | 'rejected')}
            >
              <SelectTrigger className="bg-background mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Approved concerns will be available for users to select when creating remedies
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditHealthConcern;
