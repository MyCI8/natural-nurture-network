import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomFilter, setSymptomFilter] = useState<string>("");
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

      if (symptomFilter) {
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

      // Remove image from storage if it exists
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

  const handleEdit = (remedy: any) => {
    setSelectedRemedy(remedy);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Remedies</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Remedy
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search remedies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={symptomFilter} onValueChange={setSymptomFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by symptom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Symptoms</SelectItem>
            {defaultSymptoms.map((symptom) => (
              <SelectItem key={symptom} value={symptom}>
                {symptom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: "popularity" | "recent") => setSortBy(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popularity">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="aspect-video bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {remedies.map((remedy) => (
            <Card key={remedy.id} className="group">
              <CardContent className="p-4">
                <div className="aspect-video mb-4 relative group-hover:opacity-75 transition-opacity">
                  <img
                    src={remedy.image_url}
                    alt={remedy.name}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(remedy)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRemedyToDelete(remedy)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{remedy.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {remedy.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {remedy.symptoms?.map((symptom: string, index: number) => (
                    <span
                      key={index}
                      className="text-xs bg-secondary px-2 py-1 rounded-full"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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