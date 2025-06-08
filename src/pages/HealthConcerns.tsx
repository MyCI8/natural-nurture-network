
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import HealthConcernsMarquee from "@/components/HealthConcernsMarquee";
import { Search, RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expert {
  id: string;
  full_name: string;
  image_url: string | null;
}

interface Remedy {
  id: string;
  name: string;
}

interface HealthConcern {
  id: string;
  name: string;
  brief_description: string | null;
  remedy_health_concerns: {
    remedy_id: string;
    remedies: Remedy;
  }[] | null;
  expert_health_concerns: {
    expert_id: string;
    experts: Expert;
  }[] | null;
}

const HealthConcerns = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const {
    data: healthConcerns,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["health-concerns"],
    queryFn: async () => {
      console.log("Fetching health concerns...");
      try {
        const { data, error } = await supabase
          .from("health_concerns")
          .select(`
            id,
            name,
            brief_description,
            remedy_health_concerns (
              remedy_id,
              remedies (
                id,
                name
              )
            ),
            expert_health_concerns (
              expert_id,
              experts (
                id,
                full_name,
                image_url
              )
            )
          `)
          .order('name');

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Fetched health concerns data:", data);
        return data as unknown as HealthConcern[];
      } catch (err) {
        console.error("Error fetching health concerns:", err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  const filteredHealthConcerns = healthConcerns?.filter((concern) =>
    concern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    concern.brief_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="pt-12">
        <div className="max-w-[800px] mx-auto px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-accent/50 dark:hover:bg-accent-dark/50 transition-all rounded-full w-10 h-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Unable to load health concerns</h1>
            <p className="text-muted-foreground mb-8">
              There was a problem loading the health concerns. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-12">
        <div className="max-w-[800px] mx-auto px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-accent/50 dark:hover:bg-accent-dark/50 transition-all rounded-full w-10 h-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="mb-12">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12 px-0 py-[30px]">
      <div className="max-w-[800px] mx-auto px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 dark:hover:bg-accent-dark/50 transition-all rounded-full w-10 h-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Health Concerns</h1>
          <p className="text-xl text-muted-foreground">
            Explore common health concerns and their natural remedies
          </p>
        </div>

        <HealthConcernsMarquee />

        <div className="my-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="search"
            placeholder="Search health concerns..."
            className="pl-10 w-full max-w-md bg-background dark:bg-muted/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card dark:bg-card rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border dark:border-border">
                <TableHead>Name</TableHead>
                <TableHead>Brief Description</TableHead>
                <TableHead className="text-center">Remedies</TableHead>
                <TableHead className="text-center">Experts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHealthConcerns?.map((concern) => (
                <TableRow
                  key={concern.id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/10 border-border dark:border-border"
                >
                  <TableCell className="font-medium">
                    <Link
                      to={`/health-concerns/${concern.id}`}
                      className="text-primary hover:underline"
                    >
                      {concern.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-muted-foreground">
                      {concern.brief_description || 'No description available'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {concern.remedy_health_concerns?.length || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center -space-x-2">
                      {concern.expert_health_concerns?.slice(0, 3).map(({ experts }) => (
                        <img
                          key={experts.id}
                          src={experts.image_url || "/placeholder.svg"}
                          alt={experts.full_name}
                          className="w-8 h-8 rounded-full border-2 border-background dark:border-background"
                          title={experts.full_name}
                        />
                      ))}
                      {(concern.expert_health_concerns?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm border-2 border-background dark:border-background">
                          +{(concern.expert_health_concerns?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(filteredHealthConcerns?.length || 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No health concerns found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HealthConcerns;
