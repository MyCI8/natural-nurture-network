
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import RemedyListHeader from "./remedies/RemedyListHeader";
import RemedyFilters from "./remedies/RemedyFilters";
import RemedyGrid from "./remedies/RemedyGrid";
import RemedyForm from "./RemedyForm";
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const ManageRemedies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomFilter, setSymptomFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popularity" | "recent">("recent");
  const [showForm, setShowForm] = useState(false);
  const [selectedRemedy, setSelectedRemedy] = useState<any>(null);
  const [remedyToDelete, setRemedyToDelete] = useState<any>(null);

  const { data: remedies = [], isLoading } = useQuery({
    queryKey: ["admin-remedies", searchQuery, symptomFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("remedies")
        .select(`
          *,
          experts:expert_remedies(
            expert:experts(*)
          )
        `);

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (symptomFilter && symptomFilter !== "all") {
        query = query.contains("symptoms", [symptomFilter]);
      }

      if (sortBy === "popularity") {
        query = query.order("click_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!remedyToDelete) return;

    try {
      const { error } = await supabase
        .from("remedies")
        .delete()
        .eq("id", remedyToDelete.id);

      if (error) throw error;

      if (remedyToDelete.image_url) {
        const imagePath = remedyToDelete.image_url.split("/").pop();
        if (imagePath) {
          await supabase.storage.from("remedy-images").remove([imagePath]);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      toast({
        title: "Success",
        description: "Remedy deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting remedy:", error);
      toast({
        title: "Error",
        description: "Failed to delete remedy",
        variant: "destructive",
      });
    } finally {
      setRemedyToDelete(null);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedRemedy(null);
  };

  return (
    <div className="space-y-6">
      <RemedyListHeader />
      
      <RemedyFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        symptomFilter={symptomFilter}
        setSymptomFilter={setSymptomFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        defaultSymptoms={defaultSymptoms}
      />

      <RemedyGrid 
        remedies={remedies}
        isLoading={isLoading}
        onDelete={setRemedyToDelete}
      />

      {showForm && (
        <RemedyForm 
          onClose={handleFormClose}
          remedy={selectedRemedy}
        />
      )}

      <AlertDialog open={!!remedyToDelete} onOpenChange={() => setRemedyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the remedy
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageRemedies;
