
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface RelatedIngredientsSectionProps {
  selectedIngredients: string[];
  setSelectedIngredients: (ingredients: string[]) => void;
}

export const RelatedIngredientsSection = ({
  selectedIngredients,
  setSelectedIngredients,
}: RelatedIngredientsSectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    brief_description: "",
  });

  const { data: ingredients = [], refetch } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleIngredientCreate = async () => {
    try {
      const { data, error } = await supabase
        .from("ingredients")
        .insert([newIngredient])
        .select()
        .single();

      if (error) throw error;

      toast.success("Ingredient added successfully");
      setIsDialogOpen(false);
      setNewIngredient({ name: "", brief_description: "" });
      refetch();
    } catch (error) {
      toast.error("Failed to add ingredient");
    }
  };

  const handleIngredientSelect = (value: string) => {
    if (!selectedIngredients.includes(value)) {
      setSelectedIngredients([...selectedIngredients, value]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Related Ingredients</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Brief Description</Label>
                <Input
                  value={newIngredient.brief_description}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, brief_description: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleIngredientCreate}>Create Ingredient</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <Select onValueChange={handleIngredientSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an ingredient" />
          </SelectTrigger>
          <SelectContent>
            {ingredients.map((ingredient) => (
              <SelectItem key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-4 space-y-2">
          {selectedIngredients.map((id) => {
            const ingredient = ingredients.find((i) => i.id === id);
            if (!ingredient) return null;
            
            return (
              <div
                key={id}
                className="flex items-center justify-between p-2 bg-accent rounded-md"
              >
                <span>{ingredient.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIngredients(selectedIngredients.filter((i) => i !== id))}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
