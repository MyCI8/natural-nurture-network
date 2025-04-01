
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const Remedies = () => {
  const navigate = useNavigate();
  
  const { data: remedies, isLoading } = useQuery({
    queryKey: ["remedies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("remedies")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="pt-6 sm:pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden dark:bg-dm-foreground border-0 dark:border-dm-mist">
              <CardContent className="p-0">
                <Skeleton className="h-40 sm:h-48 w-full dark:bg-dm-mist-extra" />
                <div className="p-4 sm:p-6 space-y-2">
                  <Skeleton className="h-5 sm:h-6 w-3/4 dark:bg-dm-mist-extra" />
                  <Skeleton className="h-4 w-full dark:bg-dm-mist-extra" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 sm:pt-12">
      <div className="mb-6 sm:mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-text-light dark:text-dm-text-supporting hover:text-primary dark:hover:text-dm-primary mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 dark:text-dm-text">Natural Remedies</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {remedies?.map((remedy) => (
          <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
            <Card className="overflow-hidden animate-fadeIn hover:shadow-lg dark:hover:shadow-black/20 transition-shadow duration-200 dark:bg-dm-foreground border-0 dark:border-dm-mist">
              <CardContent className="p-0">
                <div className="h-40 sm:h-48">
                  <img
                    src={remedy.image_url || "/placeholder.svg"}
                    alt={remedy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-primary dark:text-primary mb-2">
                    {remedy.name}
                  </h3>
                  <p className="text-sm sm:text-base text-text-light dark:text-dm-text-supporting line-clamp-2">
                    {remedy.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Remedies;
