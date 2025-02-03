import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
import { supabase } from "@/integrations/supabase/client";
import IngredientForm from "./IngredientForm";

const ManageIngredients = () => {
  const { toast } = useToast();
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteIngredient, setDeleteIngredient] = useState<any>(null);

  const { data: ingredients = [], refetch } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    if (!deleteIngredient) return;

    try {
      const { error } = await supabase
        .from("ingredients")
        .delete()
        .eq("id", deleteIngredient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ingredient deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ingredient",
        variant: "destructive",
      });
    } finally {
      setDeleteIngredient(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Manage Ingredients</h2>
        <Button onClick={() => {
          setSelectedIngredient(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <TableRow key={ingredient.id}>
              <TableCell>
                {ingredient.image_url ? (
                  <img
                    src={ingredient.image_url}
                    alt={ingredient.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded" />
                )}
              </TableCell>
              <TableCell className="font-medium">{ingredient.name}</TableCell>
              <TableCell>{ingredient.description}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedIngredient(ingredient);
                      setIsFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteIngredient(ingredient)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isFormOpen && (
        <IngredientForm
          ingredient={selectedIngredient}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedIngredient(null);
          }}
          onSave={refetch}
        />
      )}

      <AlertDialog open={!!deleteIngredient} onOpenChange={() => setDeleteIngredient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ingredient
              and remove it from our records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageIngredients;