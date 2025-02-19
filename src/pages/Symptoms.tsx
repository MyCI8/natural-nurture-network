
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SymptomsMarquee from "@/components/SymptomsMarquee";

const Symptoms = () => {
  const { data: symptoms, isLoading } = useQuery({
    queryKey: ["symptoms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("symptom_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <SymptomsMarquee />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Symptoms</h1>
          <p className="text-xl text-text-light">
            Explore common health symptoms and their natural remedies
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {symptoms?.map((symptom) => (
            <Link to={`/symptoms/${symptom.id}`} key={symptom.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  {symptom.image_url && (
                    <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                      <img
                        src={symptom.image_url}
                        alt={symptom.symptom}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{symptom.symptom}</h3>
                  {symptom.brief_description && (
                    <p className="text-text-light line-clamp-2">
                      {symptom.brief_description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Symptoms;
