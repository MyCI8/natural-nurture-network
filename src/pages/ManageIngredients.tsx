
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import IngredientForm from "@/components/admin/IngredientForm";
import IngredientsTable from "@/components/admin/ingredients/IngredientsTable";
import DeleteIngredientDialog from "@/components/admin/ingredients/DeleteIngredientDialog";

const ManageIngredients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteIngredient, setDeleteIngredient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

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

          <IngredientsTable 
            ingredients={ingredients}
            onEdit={(ingredient) => {
              setSelectedIngredient(ingredient);
              setIsFormOpen(true);
            }}
            onDelete={setDeleteIngredient}
          />

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

          <DeleteIngredientDialog
            isOpen={!!deleteIngredient}
            onClose={() => setDeleteIngredient(null)}
            onConfirm={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageIngredients;
