
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { IngredientHeader } from "@/components/ingredients/IngredientHeader";
import { IngredientDescription } from "@/components/ingredients/IngredientDescription";
import { IngredientVideos } from "@/components/ingredients/IngredientVideos";
import { parseVideos } from "@/components/ingredients/types";
import type { Expert } from "@/types/expert";

const IngredientDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: ingredient, isLoading: isLoadingIngredient } = useQuery({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      if (!id) {throw new Error("No ingredient ID provided");}
      
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {throw error;}
      return data;
    },
    enabled: !!id,
  });

  const { data: expertsData, isLoading: isLoadingExperts } = useQuery({
    queryKey: ["ingredient-experts", id],
    queryFn: async () => {
      if (!id) {throw new Error("No ingredient ID provided");}
      
      const { data, error } = await supabase
        .from("remedies")
        .select(`
          id,
          experts:expert_remedies(
            expert:experts(
              id,
              full_name,
              image_url,
              title
            )
          )
        `)
        .contains('ingredients', [id]);

      if (error) {throw error;}

      const experts = new Set<Expert>();
      data?.forEach(remedy => {
        remedy.experts?.forEach(er => {
          if (er.expert) {
            experts.add(er.expert as Expert);
          }
        });
      });

      return {
        remedyCount: data?.length || 0,
        experts: Array.from(experts)
      };
    },
    enabled: !!id,
  });

  if (isLoadingIngredient || isLoadingExperts) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!ingredient) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-bold">Ingredient not found</h1>
        </div>
      </div>
    );
  }

  const videos = parseVideos(ingredient.videos);

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <IngredientHeader
            name={ingredient.name}
            briefDescription={ingredient.brief_description}
            remedyCount={expertsData?.remedyCount || 0}
            experts={expertsData?.experts || []}
          />
          
          <IngredientDescription
            fullDescription={ingredient.full_description}
            imageUrl={ingredient.image_url}
            name={ingredient.name}
          />

          <IngredientVideos videos={videos} />
        </div>
      </div>
    </div>
  );
};

export default IngredientDetail;
