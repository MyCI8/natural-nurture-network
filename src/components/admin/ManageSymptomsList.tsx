
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SymptomsList from "./symptoms/SymptomsList";
import { toast } from "sonner";

const ManageSymptomsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: symptoms = [], isLoading } = useQuery({
    queryKey: ["admin-symptoms", searchQuery],
    queryFn: async () => {
      const query = supabase
        .from("symptom_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query.ilike("symptom", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleAddSymptom = () => {
    navigate("/admin/symptoms/new");
  };

  const handleDeleteSymptom = async (symptomId: string) => {
    try {
      const { error } = await supabase
        .from("symptom_details")
        .delete()
        .eq("id", symptomId);

      if (error) throw error;

      toast.success("Symptom deleted successfully");
    } catch (error) {
      console.error("Error deleting symptom:", error);
      toast.error("Failed to delete symptom");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            All Symptoms
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and edit symptoms and conditions
          </p>
        </div>
        <Button onClick={handleAddSymptom}>
          <Plus className="mr-2 h-4 w-4" /> Add Symptom
        </Button>
      </div>

      <SymptomsList
        symptoms={symptoms}
        isLoading={isLoading}
        onDelete={handleDeleteSymptom}
      />
    </div>
  );
};

export default ManageSymptomsList;
