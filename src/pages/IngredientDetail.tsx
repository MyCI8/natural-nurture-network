import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const IngredientDetail = () => {
  const { id } = useParams();

  const { data: ingredient, isLoading } = useQuery({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ingredient) return null;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-6">{ingredient.name}</h1>
            
            {ingredient.image_url && (
              <div className="mb-6">
                <img
                  src={ingredient.image_url}
                  alt={ingredient.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {ingredient.summary && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Summary</h2>
                <p className="text-text-light">{ingredient.summary}</p>
              </div>
            )}

            {ingredient.description && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <div dangerouslySetInnerHTML={{ __html: ingredient.description }} />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
            <div className="space-y-4">
              {ingredient.videos?.map((video: any, index: number) => (
                <Card key={index} className="p-4">
                  {video.thumbnail && (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-medium">{video.title}</h3>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Watch Video
                  </a>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientDetail;