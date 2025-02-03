import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import IngredientForm from "./IngredientForm";

const ManageIngredients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: ingredients = [], isLoading } = useQuery({
    queryKey: ["admin-ingredients", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("ingredients")
        .select("*");

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Ingredients</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Ingredient
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((ingredient) => (
          <Card key={ingredient.id}>
            <CardContent className="p-4">
              <div className="aspect-video mb-4">
                <img
                  src={ingredient.image_url || "/placeholder.svg"}
                  alt={ingredient.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <h3 className="font-semibold mb-2">{ingredient.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {ingredient.description || "No description available"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/ingredients/${ingredient.id}`)}
                >
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <IngredientForm 
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default ManageIngredients;