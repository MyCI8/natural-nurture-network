
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const HealthConcernDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: healthConcern, isLoading } = useQuery({
    queryKey: ["health-concern", id],
    queryFn: async () => {
      if (!id) throw new Error("No health concern ID provided");
      
      const { data, error } = await supabase
        .from("health_concerns")
        .select(`
          *,
          remedy_health_concerns (
            remedies (
              id,
              name,
              brief_description,
              image_url
            )
          ),
          expert_health_concerns (
            experts (
              id,
              full_name,
              title,
              image_url
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Log the health concern view
  React.useEffect(() => {
    if (healthConcern) {
      const logView = async () => {
        try {
          const { data: user } = await supabase.auth.getUser();
          await supabase.from("health_concern_clicks").insert({
            health_concern_name: healthConcern.name,
            user_id: user.user?.id || null,
          });
        } catch (error) {
          console.error("Error logging health concern view:", error);
        }
      };
      logView();
    }
  }, [healthConcern]);

  if (isLoading) {
    return (
      <div className="pt-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-8 w-1/2 mb-4" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!healthConcern) {
    return (
      <div className="pt-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Health Concern Not Found</h1>
            <p className="text-muted-foreground">
              The health concern you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{healthConcern.name}</h1>
          {healthConcern.brief_description && (
            <p className="text-xl text-muted-foreground">
              {healthConcern.brief_description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {healthConcern.image_url && (
            <div>
              <img
                src={healthConcern.image_url}
                alt={healthConcern.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div>
            {healthConcern.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: healthConcern.description }}
                />
              </div>
            )}

            {healthConcern.remedy_health_concerns && 
             healthConcern.remedy_health_concerns.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Related Remedies</h2>
                <div className="grid gap-4">
                  {healthConcern.remedy_health_concerns.map(({ remedies }) => (
                    <div key={remedies.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{remedies.name}</h3>
                      {remedies.brief_description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {remedies.brief_description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healthConcern.expert_health_concerns && 
             healthConcern.expert_health_concerns.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Expert Recommendations</h2>
                <div className="grid gap-4">
                  {healthConcern.expert_health_concerns.map(({ experts }) => (
                    <div key={experts.id} className="flex items-center space-x-4 border rounded-lg p-4">
                      <img
                        src={experts.image_url || "/placeholder.svg"}
                        alt={experts.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{experts.full_name}</h3>
                        {experts.title && (
                          <p className="text-sm text-muted-foreground">{experts.title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthConcernDetail;
