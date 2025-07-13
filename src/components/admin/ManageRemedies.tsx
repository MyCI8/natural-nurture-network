
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Database } from "@/integrations/supabase/types";

const defaultHealthConcerns: string[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const ManageRemedies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [healthConcernFilter, setHealthConcernFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popularity" | "recent">("recent");
  const [remedyToDelete, setRemedyToDelete] = useState<any>(null);
  const [isPublishingAll, setIsPublishingAll] = useState(false);

  const { data: remedies = [], isLoading } = useQuery({
    queryKey: ["admin-remedies", searchQuery, healthConcernFilter, sortBy],
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

      if (healthConcernFilter && healthConcernFilter !== "all") {
        query = query.contains("health_concerns", [healthConcernFilter]);
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

  const handlePublishAll = async () => {
    setIsPublishingAll(true);
    try {
      // Update all draft remedies to published
      const { error } = await supabase
        .from("remedies")
        .update({ status: "published" })
        .neq("status", "published");

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      queryClient.invalidateQueries({ queryKey: ["remedies"] });
      queryClient.invalidateQueries({ queryKey: ["latest-remedies"] });
      queryClient.invalidateQueries({ queryKey: ["popularRemedies"] });
      
      toast({
        title: "Success",
        description: "All remedies have been published successfully",
      });
    } catch (error) {
      console.error("Error publishing remedies:", error);
      toast({
        title: "Error",
        description: "Failed to publish all remedies",
        variant: "destructive",
      });
    } finally {
      setIsPublishingAll(false);
    }
  };

  const handleToggleStatus = async (remedy: any) => {
    try {
      const newStatus = remedy.status === "published" ? "draft" : "published";
      
      const { error } = await supabase
        .from("remedies")
        .update({ status: newStatus })
        .eq("id", remedy.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["admin-remedies"] });
      queryClient.invalidateQueries({ queryKey: ["remedies"] });
      queryClient.invalidateQueries({ queryKey: ["latest-remedies"] });
      queryClient.invalidateQueries({ queryKey: ["popularRemedies"] });
      
      toast({
        title: "Success",
        description: `Remedy ${newStatus === "published" ? "published" : "unpublished"} successfully`,
      });
    } catch (error) {
      console.error("Error updating remedy status:", error);
      toast({
        title: "Error",
        description: "Failed to update remedy status",
        variant: "destructive",
      });
    }
  };

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

  const draftCount = remedies.filter(r => r.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <RemedyListHeader />
        
        {draftCount > 0 && (
          <Button 
            onClick={handlePublishAll}
            disabled={isPublishingAll}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishingAll ? "Publishing..." : `Publish All (${draftCount})`}
          </Button>
        )}
      </div>
      
      <RemedyFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        healthConcernFilter={healthConcernFilter}
        setHealthConcernFilter={setHealthConcernFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        defaultHealthConcerns={defaultHealthConcerns}
      />

      <RemedyGrid 
        remedies={remedies}
        isLoading={isLoading}
        onDelete={setRemedyToDelete}
        onToggleStatus={handleToggleStatus}
      />

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
