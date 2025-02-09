
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Json } from "@/integrations/supabase/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Video {
  title: string;
  url: string;
  thumbnail?: string;
}

interface Expert {
  id: string;
  full_name: string;
  image_url: string | null;
}

const IngredientDetail = () => {
  const { id } = useParams();

  const { data: ingredient, isLoading: isLoadingIngredient } = useQuery({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      if (!id) throw new Error("No ingredient ID provided");
      
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: expertsData, isLoading: isLoadingExperts } = useQuery({
    queryKey: ["ingredient-experts", id],
    queryFn: async () => {
      if (!id) throw new Error("No ingredient ID provided");
      
      const { data, error } = await supabase
        .from("remedies")
        .select(`
          id,
          experts:expert_remedies(
            expert:experts(
              id,
              full_name,
              image_url
            )
          )
        `)
        .contains('ingredients', [id]);

      if (error) throw error;

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

  const parseVideos = (videosData: Json | null): Video[] => {
    if (!videosData || !Array.isArray(videosData)) return [];
    
    return videosData
      .filter((video): video is { title: string; url: string; thumbnail?: string } => {
        if (typeof video !== 'object' || video === null) return false;
        const v = video as any;
        return typeof v.title === 'string' && typeof v.url === 'string' &&
               (v.thumbnail === undefined || typeof v.thumbnail === 'string');
      });
  };

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
          <h1 className="text-3xl font-bold">{ingredient.name}</h1>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Used in Remedies</TableHead>
                <TableHead>Recommended by Experts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>{ingredient.brief_description || 'No summary available'}</TableCell>
                <TableCell>{expertsData?.remedyCount || 0} remedies</TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {expertsData?.experts.map((expert) => (
                      <Avatar
                        key={expert.id}
                        className="border-2 border-background"
                        title={expert.full_name}
                      >
                        <AvatarImage src={expert.image_url || undefined} />
                        <AvatarFallback>
                          {expert.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {ingredient.image_url && (
            <div className="mb-6">
              <img
                src={ingredient.image_url}
                alt={ingredient.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {ingredient.full_description && (
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <div dangerouslySetInnerHTML={{ __html: ingredient.full_description }} />
            </div>
          )}

          {videos.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Related Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, index) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default IngredientDetail;
