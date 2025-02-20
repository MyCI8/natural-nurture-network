import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import SymptomsMarquee from "@/components/SymptomsMarquee";
import { Search, RefreshCw } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

type SymptomType = Database["public"]["Enums"]["symptom_type"];

interface Expert {
  id: string;
  full_name: string;
  image_url: string | null;
}

interface Remedy {
  id: string;
  name: string;
}

interface Symptom {
  id: string;
  symptom: SymptomType;
  brief_description: string | null;
  symptom_remedies: {
    remedy_id: string;
    remedy: Remedy;
  }[] | null;
  symptom_experts: {
    expert_id: string;
    experts: Expert;
  }[] | null;
}

const Symptoms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { 
    data: symptoms, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["symptoms"],
    queryFn: async () => {
      console.log("Fetching symptoms...");
      try {
        const { data, error } = await supabase
          .from("symptom_details")
          .select(`
            id,
            symptom,
            brief_description,
            symptom_remedies!inner (
              remedy_id,
              remedies!inner (
                id,
                name
              )
            ),
            symptom_experts!inner (
              expert_id,
              experts!inner (
                id,
                full_name,
                image_url
              )
            )
          `)
          .order('symptom');

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Fetched symptoms data:", data);
        return data as unknown as Symptom[];
      } catch (err) {
        console.error("Error fetching symptoms:", err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  const filteredSymptoms = symptoms?.filter((symptom) =>
    symptom.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    symptom.brief_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Unable to load symptoms</h1>
            <p className="text-muted-foreground mb-8">
              There was a problem loading the symptoms. Please try again.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="gap-2"
            >
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
      <div className="min-h-screen bg-gradient-to-b from-secondary to-background pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-gradient-to-b from-secondary to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Symptoms</h1>
          <p className="text-xl text-muted-foreground">
            Explore common health symptoms and their natural remedies
          </p>
        </div>

        <SymptomsMarquee />

        <div className="my-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="search"
            placeholder="Search symptoms..."
            className="pl-10 w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-card rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brief Description</TableHead>
                <TableHead className="text-center">Remedies</TableHead>
                <TableHead className="text-center">Experts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSymptoms?.map((symptom) => (
                <TableRow key={symptom.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link 
                      to={`/symptoms/${symptom.id}`}
                      className="text-primary hover:underline"
                    >
                      {symptom.symptom}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-muted-foreground">
                      {symptom.brief_description || 'No description available'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {symptom.symptom_remedies?.length || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center -space-x-2">
                      {symptom.symptom_experts?.slice(0, 3).map(({ experts }) => (
                        <img
                          key={experts.id}
                          src={experts.image_url || "/placeholder.svg"}
                          alt={experts.full_name}
                          className="w-8 h-8 rounded-full border-2 border-white"
                          title={experts.full_name}
                        />
                      ))}
                      {(symptom.symptom_experts?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm border-2 border-white">
                          +{(symptom.symptom_experts?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(filteredSymptoms?.length || 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No symptoms found</p>
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

export default Symptoms;
