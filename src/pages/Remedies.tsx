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
      <div className="pt-12">
        <div className="max-w-[800px] mx-auto px-2">
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-text-light hover:text-primary mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold mb-6">Natural Remedies</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="max-w-[800px] mx-auto px-2">
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-text-light hover:text-primary mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold mb-6">Natural Remedies</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {remedies?.map((remedy) => (
            <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
              <Card className="overflow-hidden animate-fadeIn hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-0">
                  <div className="h-48">
                    <img
                      src={remedy.image_url || "/placeholder.svg"}
                      alt={remedy.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-text mb-2">
                      {remedy.name}
                    </h3>
                    <p className="text-text-light line-clamp-2">
                      {remedy.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Remedies;
