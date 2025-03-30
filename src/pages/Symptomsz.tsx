
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, ArrowLeft } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { DebugData } from "@/components/ui/debug-data";

type SymptomType = Database["public"]["Enums"]["symptom_type"];

interface Symptom {
  id: string;
  symptom: SymptomType;
  brief_description: string | null;
}

const Symptomsz = () => {
  const navigate = useNavigate();
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
      console.log("Fetching symptoms for Symptomsz page...");
      try {
        const { data, error } = await supabase
          .from("symptom_details")
          .select(`
            id,
            symptom,
            brief_description
          `)
          .order('symptom');

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Fetched symptoms data:", data);
        return data as Symptom[];
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
      <div className="pt-12">
        <div className="max-w-[800px] mx-auto px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Unable to load symptoms</h1>
            <p className="text-muted-foreground mb-8">
              There was a problem loading the symptoms. Please try again.
            </p>
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="gap-2 touch-manipulation"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
          <DebugData 
            data={{ error: error instanceof Error ? error.message : String(error) }}
            title="Error Details"
            className="mt-8"
          />
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
            className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="mb-12">
            <Skeleton className="h-12 w-48 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-12 w-full mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="max-w-[800px] mx-auto px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-accent/50 transition-all rounded-full w-10 h-10 touch-manipulation"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary/90">Symptomsz</h1>
          <h3 className="text-xl text-muted-foreground">
            Explore common health symptoms and their natural remedies
          </h3>
        </div>

        <div className="my-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="search"
            placeholder="Search symptoms..."
            className="pl-10 w-full touch-manipulation"
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSymptoms?.map((symptom) => (
                <TableRow key={symptom.id} className="hover:bg-muted/50 touch-manipulation">
                  <TableCell className="font-medium">
                    <Link 
                      to={`/symptoms/${symptom.id}`}
                      className="text-primary hover:underline block py-2"
                    >
                      {symptom.symptom}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-muted-foreground">
                      {symptom.brief_description || 'No description available'}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
              {(filteredSymptoms?.length || 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
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

export default Symptomsz;
