
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
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
import IngredientForm from "@/components/admin/IngredientForm";

const ManageIngredients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteIngredient, setDeleteIngredient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated and has admin role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          toast({
            title: "Unauthorized",
            description: "Please log in to access this page",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (rolesError || !roles || roles.role !== "admin") {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate, toast]);

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
    enabled: !isLoading,
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
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
                <TableRow 
                  key={ingredient.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/admin/ingredients/${ingredient.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIngredient(ingredient);
                          setIsFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteIngredient(ingredient);
                        }}
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
      </div>
    </div>
  );
};

export default ManageIngredients;
