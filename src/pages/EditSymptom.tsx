
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

const EditSymptom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewSymptom = id === "new";

  const form = useForm({
    defaultValues: {
      symptom: "",
      brief_description: "",
      description: "",
      image_url: "",
      video_url: "",
    },
  });

  const { data: symptom, isLoading } = useQuery({
    queryKey: ["symptom", id],
    queryFn: async () => {
      if (isNewSymptom) return null;
      
      const { data, error } = await supabase
        .from("symptom_details")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isNewSymptom,
  });

  const handleSave = async (values: any) => {
    try {
      if (isNewSymptom) {
        const { error } = await supabase
          .from("symptom_details")
          .insert([values]);

        if (error) throw error;
        toast.success("Symptom created successfully");
      } else {
        const { error } = await supabase
          .from("symptom_details")
          .update(values)
          .eq("id", id);

        if (error) throw error;
        toast.success("Symptom updated successfully");
      }

      navigate("/admin/symptoms");
    } catch (error) {
      console.error("Error saving symptom:", error);
      toast.error("Failed to save symptom");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isNewSymptom ? "Add New Symptom" : "Edit Symptom"}
        </h1>
        <Button onClick={form.handleSubmit(handleSave)}>
          Save Changes
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="symptom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptom Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brief_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[200px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSymptom;
